class Recognize {
    // you can try and tune these variables
    static startTime = null;
    static endTime = null;
    static calibMode = false;
    static mfccHistoryArr = [ ];
    static mfccHistoryCunters = [ ];
    // static dictionary = ['left', 'right', 'up', 'down']; 
    static bufferSize = 2048;
    static _buffArrSize = 40;      // 40   / 70
    static _minNumberOfVariants = 2;
    static _minKnnConfidence = 0;
    static _minDTWDist = 1000;
    static K_factor = 3;

    static mfccDistArr = [ ];

    static bufferMfcc;
    static buffer = { };

    static dictionary = [ 'person1' ];

    /**
     * train the system, assume that the passed audio data in the buffer fits the transcript
     * @param {*} _buffer 
     * @param {*} transcript 
     * @param {*} setStateFunc 
     */
    static train( _buffer, transcript, setStateFunc ) {
        setStateFunc( "training" + _buffer );
        this.buffer = _buffer;
        Meyda.bufferSize = this.bufferSize;
        this.bufferMfcc = this.createMfccMetric( );
        this.mfccHistoryArr.push( {
            mfcc: this.bufferMfcc,
            transcript: transcript
        } );
        return true;
    }

    /**
     * try to recognize what the audio data in the buffer is
     * @param {*} _buffer 
     * @param {*} setStateFunc 
     */
    static recognize( _buffer, setStateFunc ) {
        this.buffer = _buffer;
        Meyda.bufferSize = this.bufferSize;

        this.bufferMfcc = this.createMfccMetric( );

        this.startTime = Utils.getTimestamp( );
        setStateFunc( "recognizing" );

        this.calculateDistanceArr( );

        var knnClosest;
        if ( this.K_factor <= this.mfccHistoryArr.length ) {
            knnClosest = this.getMostSimilarKnn( this.mfccDistArr, this.compareMfcc, this.K_factor );
            if ( knnClosest && ( knnClosest.confidence < this._minKnnConfidence ) ) {
                knnClosest = null;
            }
        }
        if ( !knnClosest || knnClosest.confidence < 0.75 ) {
            this.endTime = Utils.getTimestamp( );
            setStateFunc( "not recognized" );
            console.log( "recognition locally failed or returned no good result" );
            return null;
        }
        else { // ���� ����� ����������, �� ��������� ��������� �������
            this.mfccHistoryArr.push({
                mfcc: this.bufferMfcc,
                transcript: knnClosest.transcript
            });
            knnClosest.processTime = Utils.getTimestamp( ) - this.startTime;
        }
        setStateFunc( "recognized:" + knnClosest.transcript );
        return knnClosest;
    };


    /**
     * calculate DTW distance from dictionary mfcc history
     */
    static calculateDistanceArr( ) {
        this.mfccDistArr = [];
        for ( var i = 0; i < this.mfccHistoryArr.length; i++ ) {
            if ( this.isInDictionary(this.mfccHistoryArr[i].transcript)) {
                var dtw = new DynamicTimeWarping(this.mfccHistoryArr[i].mfcc, this.bufferMfcc, this.EuclideanDistance);
                var dist = dtw.getDistance();
                this.mfccDistArr.push({
                    dist: dist,
                    transcript: this.mfccHistoryArr[i].transcript
                } );
            }
            else
                console.log(this.mfccHistoryArr[i].transcript + " is not presented in a dict");
        }
    }


    /**
     * search in dictionary
     */
    static isInDictionary( word ) {
        for ( var i = 0; i < this.dictionary.length; i++ ) {
            if ( this.dictionary[ i ] === word )
                return true;
        }
        return false;
    }

    /**
     * get the most similar transcript from audio mfcc history array, using Knn Algorithm
     * @param {*} Items 
     * @param {*} CompFunc 
     * @param {*} k 
     */
    static getMostSimilarKnn( Items, CompFunc, k ) {
        if (!Items || Items.length === 0) {
            console.log("Items is empty");
            return;
        }
        if (k > Items.length) {
            console.log(k + ">" + Items.length);
            return;
        }
        var items = Items;
        var compFunc = CompFunc;

        items.sort( compFunc );
        var kArr = items.slice( 0, k );
        var simArr = [ ];
        var maxElm = {
            transcript: '',
            weight: 0,
            confidence: 0
        };

        for ( var i = 0; i < kArr.length; i++ ) {
            if ( kArr[ i ].dist > this._minDTWDist )
                continue;

            if ( !simArr[ kArr[ i ].transcript ] )
                simArr[ kArr[ i ].transcript ] = {
                    weight: 1000 / kArr[ i ].dist,
                }
            else {
                simArr[ kArr[ i ].transcript ].weight = simArr[ kArr[ i ].transcript ].weight + 1000 / kArr[ i ].dist;
            }
            if ( maxElm.weight < simArr[ kArr[ i ].transcript ].weight ) {
                maxElm = {
                    transcript: kArr[ i ].transcript,
                    weight: simArr[ kArr[ i ].transcript ].weight,
                };
            }
        }

        if ( maxElm && maxElm.transcript === '' )
            maxElm = null;

        if ( maxElm ) {
            // calculate confidence
            var sum = 0, count = 0;
            for ( i = 0; i < items.length; i++ ) {
                if ( items[ i ].transcript === maxElm.transcript ) {
                    sum = sum + items[ i ].dist;
                    count++;
                }
            }
            maxElm.confidence = this.getGaussianKernel( sum / count ).toFixed( 4 );
        }
        return maxElm;
    }

    // 
    static getGaussianKernel( t ) {
        return Math.pow( Math.E, -1 / 2 * Math.pow( t / 1000, 2 ) );
    }

    /**
     * calculate audio buffer mfcc data
     */
    static createMfccMetric( ) {
        var mfccMetricArr = [ ];
        for ( var i = 0; i < this._buffArrSize; i++ ) {
            if ( this.buffer[ i ] && this.buffer[ i ].length === this.bufferSize ) {
                var mfccMetric = Meyda.extract( "mfcc", this.buffer[ i ] );
                mfccMetricArr.push( mfccMetric )
            }
        }
        return mfccMetricArr;
    }

    /**
     * Euclidean Distance between two victors
     * @param {*} p 
     * @param {*} q 
     */
    static EuclideanDistance( p, q ) {
        var d = 0;
        if ( p.length !== q.length )
            return -1;
        for ( var i = 0; i < p.length; i++ ) {
            d = d + Math.pow( p[ i ] - q[ i ], 2 );
        }
        return Math.sqrt( d );
    }

    /**
     * Mfcc object comparison
     * @param {*} a 
     * @param {*} b 
     */
    static compareMfcc( a, b ) {
        if ( a.dist < b.dist )
            return -1;
        if ( a.dist > b.dist )
            return 1;
        return 0;
    }
}