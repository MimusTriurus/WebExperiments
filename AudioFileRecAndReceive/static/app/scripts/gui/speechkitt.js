( function ( undefined ) {
    'use strict';
    var _root = this;
    var _listeningStoppedTimeout;
    var _minutesToRememberStatus = 0;

    var _startCommand;
    var _abortCommand;

    var _statusListening = false;

    var _stylesheet;
    var _stylesheetNode;

    var _toggleLabelText = 'Запуск распознавания голосовых команд';
    var _listeningInstructionsText = 'Я вас слушаю...';
    var _sampleCommands = [ ];

    var _recognizedSentences = [ ];

    var _displayRecognizedSentence = false;

    var _guiNodes;

    var _guiCreated = function () {
        return _guiNodes !== undefined;
    };

    var _updateStylesheet = function( ) {
        if ( _stylesheet && _guiCreated( ) ) {
            if ( _stylesheetNode ) {
                _stylesheetNode.href = _stylesheet;
            } else {
                _stylesheetNode = document.createElement(   'link' );
                _stylesheetNode.rel = 'stylesheet';
                _stylesheetNode.href = _stylesheet;
                _stylesheetNode.id = 'skitt-style-sheet';
                document.body.appendChild( _stylesheetNode );
            }
        }
    };

    var _updateListeningText = function( ) {
        if ( !_guiCreated( ) ) {
            return;
        }
        var samplesNode = document.getElementById( 'skitt-listening-text__samples' );
        if ( _sampleCommands.length ) {
            if ( !samplesNode ) {
                var nodeToInsertAfter = document.getElementById( 'skitt-listening-text__instructions' );
                samplesNode = document.createElement( 'span' );
                samplesNode.id = 'skitt-listening-text__samples';
                nodeToInsertAfter.parentNode.insertBefore( samplesNode, nodeToInsertAfter.nextSibling );
            }
            samplesNode.innerText = _sampleCommands.join( '. ' ) + '.';
            _guiNodes.classList.add( 'skitt-ui--sample-commands-shown' );
        } else {
            if ( samplesNode ) {
                samplesNode.parentNode.removeChild( samplesNode );
            }
            _guiNodes.classList.remove( 'skitt-ui--sample-commands-shown' );
        }
    };

    var _updateRecognizedSentenceText = function( ) {
        if ( !_guiCreated( ) ) {
            return;
        }
        var recognizedSentenceNode = document.getElementById( 'skitt-listening-text__recognized-sentence' );
        var lastRecognizedSentenceText = _root.SpeechKITT.getLastRecognizedSentence( );
        if ( lastRecognizedSentenceText && _displayRecognizedSentence ) {
            if ( !recognizedSentenceNode ) {
                var nodeToInsertAfter = document.getElementById( 'skitt-listening-text__samples' )
                    || document.getElementById( 'skitt-listening-text__instructions' );
                recognizedSentenceNode = document.createElement( 'span' );
                recognizedSentenceNode.id = 'skitt-listening-text__recognized-sentence';
                nodeToInsertAfter.parentNode.insertBefore( recognizedSentenceNode, nodeToInsertAfter.nextSibling );
            }
            recognizedSentenceNode.innerText = lastRecognizedSentenceText;
            _guiNodes.classList.add( 'skitt-ui--recognized-sentence-shown' );
        } else {
            if ( recognizedSentenceNode ) {
            recognizedSentenceNode.parentNode.removeChild( recognizedSentenceNode );
            }
            _guiNodes.classList.remove( 'skitt-ui--recognized-sentence-shown' );
        }
    };

    var _createGUI = function( ) {
        _guiNodes = document.createElement( 'div' );
        _guiNodes.id = 'skitt-ui';
        _guiNodes.innerHTML = '<a id="skitt-toggle-button">&nbsp;</a><label for="skitt-toggle-button" id="skitt-toggle-button__label">'+_toggleLabelText+'</label><div id="skitt-listening-box"><div id="skitt-listening-text"><span id="skitt-listening-text__instructions">'+_listeningInstructionsText+'</span></div></div>';
        _guiNodes.style.display = 'none';
        document.body.appendChild( _guiNodes );

        _updateListeningText( );

        _updateStylesheet();

        document.getElementById( 'skitt-toggle-button' ).addEventListener( 'click', function( ) {
            _root.SpeechKITT.toggleRecognition( );
        } );
    };

    var _setGUIListening = function( ) {
        if ( !_guiCreated( ) ) {
            return;
        }
        _guiNodes.classList.remove('skitt-ui--not-listening');
        _guiNodes.classList.add('skitt-ui--listening');
    };

    var _setGUINotListening = function( ) {
        if ( !_guiCreated( ) ) {
            return;
        }
        _guiNodes.classList.add( 'skitt-ui--not-listening' );
        _guiNodes.classList.remove( 'skitt-ui--listening' );
    };

    var _setStatusOn = function( ) {
        if ( !_statusListening ) {
            _statusListening = true;
            _setGUIListening( );
        }
    };

    var _setStatusOff = function( ) {
        if ( _statusListening ) {
            _statusListening = false;
            _setGUINotListening( );
        }
    };

    var _setText = function( text, id ) {
        if ( _guiCreated( ) ) {
            document.getElementById( id ).innerHTML = text;
        }
    };

    var _saveListeningStatusCookie = function( ) {
        var dtExpiration = new Date( );
        dtExpiration.setTime( dtExpiration.getTime( ) + 60000 * _minutesToRememberStatus );
        document.cookie='skittremember=1; expires='+dtExpiration.toUTCString( )+'; path=/';
    };

    var _deleteListeningStatusCookie = function( ) {
        document.cookie='skittremember=1; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    };

    var _listeningStatusCookieExists = function( ) {
        return document.cookie.indexOf( 'skittremember' ) !== -1;
    };

    var _ifNotFunctionThrowError = function( func, errorText ) {
        if ( typeof func !== 'function' ) {
            throw new TypeError( errorText );
        }
    };

    _root.SpeechKITT = {

        setStartCommand: function( callback, context ) {
            // This should work both when passed a function, or a name of a function
            callback = _root[ callback ] || callback;
            _ifNotFunctionThrowError( callback, 'invalid callback function' );
            context = context || this;

            _startCommand = { callback: callback, context: context };
        },

        setAbortCommand: function( callback, context ) {
            callback = _root[callback] || callback;
            _ifNotFunctionThrowError( callback, 'invalid callback function' );
            context = context || this;

            _abortCommand = { callback: callback, context: context };
        },

        startRecognition: function( ) {
            if ( !_startCommand ) {
                throw new TypeError( 'cannot start recognition. Start command not defined' );
            }
            if (    _minutesToRememberStatus ) {
                _saveListeningStatusCookie( );
            }
            _startCommand.callback.apply( _startCommand.context );
            _setStatusOn( );
        },

        abortRecognition: function( ) {
            if ( !_abortCommand ) {
                throw new TypeError( 'cannot abort recognition. Abort command not defined' );
            }
            _deleteListeningStatusCookie( );
            _abortCommand.callback.apply( _abortCommand.context );
            _setStatusOff( );
        },

        toggleRecognition: function( ) {
            if ( _statusListening ) {
                this.abortRecognition( );
            } else {
                this.startRecognition( );
            }
        },

        onStart: function( ) {
            _root.clearTimeout( _listeningStoppedTimeout );
            _setStatusOn( );
        },

        onEnd: function( ) {
            _listeningStoppedTimeout = setTimeout( _setStatusOff, 100 );
        },

        setStylesheet: function( css ) {
            _stylesheet = css;
            _updateStylesheet( );
        },

        render: function( ) {
            if ( !_guiCreated( ) ) {
                _createGUI( );
            }
            if ( _listeningStatusCookieExists( ) && !this.isListening( ) ) {
                this.startRecognition( );
            }
            if ( this.isListening( ) ) {
                _setGUIListening( );
            } else {
                _setGUINotListening( );
            }
        },

        vroom: function( ) {
            this.render( );
        },

        hide: function( ) {
            if ( !_guiCreated( ) ) {
                throw new TypeError( 'cannot hide interface. Must be rendered first' );
            }
            _guiNodes.classList.add( 'skitt-ui--hidden' );
        },

        show: function( ) {
            if ( !_guiCreated( ) ) {
                throw new TypeError( 'cannot show interface. Must be rendered first' );
            }
            _guiNodes.classList.remove( 'skitt-ui--hidden' );
        },

        isListening: function( ) {
            return _statusListening;
        },

        setToggleLabelText: function( text ) {
            _toggleLabelText = text;
            _setText( text, 'skitt-toggle-button__label' );
        },

        setInstructionsText: function( text ) {
            if ( typeof text === 'string' ) {
                _listeningInstructionsText = text;
                _setText(text, 'skitt-listening-text__instructions');
            }
        },

        setSampleCommands: function( commands ) {
            if ( !Array.isArray( commands ) ) {
                commands = [ ];
            }
            _sampleCommands = commands;
            _updateListeningText( );
        },

        rememberStatus: function( minutes ) {
            if ( typeof minutes !== 'number' || minutes < 0 ) {
                throw new TypeError('rememberStatus() only accepts positive integers');
            }
            _minutesToRememberStatus = minutes;
        },

        getLastRecognizedSentence: function( ) {
            if ( _recognizedSentences.length === 0 ) {
                return undefined;
            } else {
            return _recognizedSentences[ _recognizedSentences.length - 1 ];
            }
        },

        setRecognizedSentence : function( sentence ) {
            if ( typeof sentence === 'string' ) {
                _recognizedSentences.push( sentence );
                _updateRecognizedSentenceText( );
            }
        },

        displayRecognizedSentence: function( newState ) {
            if ( arguments.length > 0 ) {
                _displayRecognizedSentence = !!newState;
            } else {
            _displayRecognizedSentence = true;
            }
            _updateRecognizedSentenceText( );
        },

    };

} ).call( this );
