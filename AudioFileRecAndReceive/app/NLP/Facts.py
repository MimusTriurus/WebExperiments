from yargy import Parser
from yargy.pipelines import morph_pipeline
from yargy import rule, or_, and_
from yargy.predicates import normalized

from yargy.predicates import gram
from yargy.interpretation import fact
from yargy.predicates import gram, is_capitalized, dictionary

from yargy.predicates import (
    lte,
    gte,
    dictionary
)

Name = fact(
    'Name',
    ['first', 'last']
)

Cmd = fact(
    'command',
    ['action']
)

CmdShowMedCard = fact(
    'command',
    ['action','doc', 'name']
)

CmdAlergic = fact(
    'command',
    ['action', 'doc', 'value' ]
)

CmdAnalyzes = fact(
    'command',
    ['action', 'doc', 'day', 'month', 'year' ]
)

CmdRecipe = fact(
    'command',
    ['action', 'doc', 'value' ]
)