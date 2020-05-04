from app.NLP.Facts import *

# запрашиваемое действие
ACTION = morph_pipeline( [
    'покажи',
    'распечатай',
    'отобрази',
    'проговори',
    #'есть',
    'имеется',
    'жалоба',
    'выпиши'
] )
# запрашиваемый документ
DOC = morph_pipeline( [
    'мед карта',
    'карта',
    'медицинская карта',
    'результаты анализов',
    'анализы',
    'аллергия',
    'аллергическая реакция',
    'рецепт'
] )

MONTHS = {
    'январь',
    'февраль',
    'март',
    'апрель',
    'мая',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь'
}

MONTH_NAME = dictionary(MONTHS)
MONTH = and_(
    gte(1),
    lte(12)
)
DAY = and_(
    gte(1),
    lte(31)
)
YEAR = or_(
    gte(1900),
    lte(2100)
)

NAME = rule(
    gram('Name').interpretation(
        Name.first.inflected()
    ),
    gram('Surn').interpretation(
        Name.last.inflected()
    )
).interpretation(
    Name
)

CMD = rule(
    ACTION.interpretation(
        Cmd.action.inflected( )
    )
).interpretation(
    Cmd
)

CMD_SHOW_MED_CARD = rule(
    ACTION.interpretation(
        CmdShowMedCard.action
    ),
    DOC.interpretation(
        CmdShowMedCard.doc.inflected( )
    ),
    NAME.interpretation(
        CmdShowMedCard.name
    )
).interpretation(
    CmdShowMedCard
)

CMD_ALERGIC = rule(
    ACTION.interpretation(
        CmdAlergic.action
    ),    
    DOC.interpretation(
        CmdAlergic.doc
    ),
    and_(
        gram('PREP')
    ),
    and_(
        gram('NOUN')
    ).interpretation(
        CmdAlergic.value )
).interpretation(
    CmdAlergic
)

CMD_ANALYZES = rule (
    ACTION.interpretation( CmdAnalyzes.action ),
    DOC.interpretation( CmdAnalyzes.doc ),
    gram('PREP').optional( ),
    DAY.interpretation( CmdAnalyzes.day ),
    MONTH_NAME.interpretation( CmdAnalyzes.month ),
    YEAR.interpretation( CmdAnalyzes.year ).optional( ),
).interpretation(
    CmdAnalyzes
)

CMD_RECIPE = rule(
    ACTION.interpretation(
        CmdRecipe.action
    ),    
    DOC.interpretation(
        CmdRecipe.doc
    ),
    and_(
        gram('PREP')
    ),
    and_(
        gram('NOUN')
    ).interpretation(
        CmdRecipe.value )
).interpretation(
    CmdRecipe
)