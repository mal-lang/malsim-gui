"""Defined the rest api app and all the endpoints"""

import time
from typing import Optional
from pathlib import Path
from os.path import realpath

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import (
    get_redoc_html,
    get_swagger_ui_html,
    get_swagger_ui_oauth2_redirect_html,
)
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

mal_app = FastAPI(docs_url=None, redoc_url=None)

# Host swagger docs in static folder instead of external cdn
mal_app.mount(
    "/static",
    StaticFiles(
        directory=realpath(f'{realpath(__file__)}/../static')
    ),
    name="static"
)

# Built Angular frontend under /dashboard
mal_app.mount(
    "/dashboard",
    StaticFiles(
        directory=realpath(f'{realpath(__file__)}/../frontend'), html=True
    ),
    name="frontend"
)

@mal_app.get('/')
def get_root():
    return RedirectResponse('/dashboard')

# Allow all cross origin requests to simplify demo
origins = ["*"]

mal_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models below used for input/output validation
class SerializedMalModel(BaseModel):
    """Represents a serialized maltoolbox.Model"""
    metadata: dict
    assets: dict

class SerializedMalAttackGraph(BaseModel):
    """Represents a serialized maltoolbox.AttackGraph"""
    attack_steps: dict

class DefenderActionSuggestion(BaseModel):
    """Represents a suggested defense step"""
    weight: float
    action: dict
    iteration: int
    time_uploaded: float = Field(default_factory=lambda: time.time())

class DefenderActionChoice(BaseModel):
    """Represents a chosen defense step"""
    iteration: int
    node_id: Optional[int]

class RewardValue(BaseModel):
    """The reward for the latest iteration"""
    iteration: int
    reward: float

class PerformedNode(BaseModel):
    """A node that was performed"""
    iteration: int
    node_id: int

# Initialize all states with default values
serialized_model = SerializedMalModel(metadata={}, assets={})
serialized_attack_graph = (
    SerializedMalAttackGraph(attack_steps={})
)
performed_nodes: list[PerformedNode] = []
latest_attack_steps: dict[int, list[dict]] = {0: []}
defender_suggestions: dict[str, dict[int, DefenderActionSuggestion]] = {}
selected_defender_action = DefenderActionChoice(iteration=-1, node_id=None)
reward_value: RewardValue = RewardValue(iteration=-1, reward=0.0)

# Static swagger stuff
@mal_app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url='openapi.json',
        title=mal_app.title + " - Swagger UI",
        oauth2_redirect_url=mal_app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="static/swagger-ui-bundle.js",
        swagger_css_url="static/swagger-ui.css",
    )

@mal_app.get(mal_app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()

@mal_app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=mal_app.openapi_url,
        title=mal_app.title + " - ReDoc",
        redoc_js_url="static/redoc.standalone.js",
    )


@mal_app.post("/model", response_class=PlainTextResponse)
async def upload_model(model: SerializedMalModel):
    """Set inital model to given json object

    The format of the uploaded model should abide to
    maltoolbox.model.Model._to_dict()
    """
    global serialized_model
    serialized_model = model
    return 'success'

@mal_app.get("/model")
async def get_model() -> SerializedMalModel:
    """Return the intial model as json object

    Format of the model is given by maltoolbox.model.Model._to_dict()
    """
    global serialized_model
    return serialized_model


@mal_app.post("/attack_graph", response_class=PlainTextResponse)
async def upload_attack_graph(attack_graph: SerializedMalAttackGraph):
    """Set initial attack graph to given json object

    The format of the uploaded attack graph should abide to
    maltoolbox.attackgraph.AttackGraph._to_dict()
    """
    global serialized_attack_graph
    serialized_attack_graph = attack_graph
    return 'success'

@mal_app.get("/attack_graph")
async def get_attack_graph() -> SerializedMalAttackGraph:
    """Return the initial attack graph as json object
    
    Format for attack graph given by
    maltoolbox.attackgraph.AttackGraph._to_dict()
    """
    global serialized_attack_graph
    return serialized_attack_graph


@mal_app.get("/performed_nodes", response_model_exclude_none=True)
async def get_performed_nodes(
    iter: Optional[int] = None,
    from_iter: Optional[int] = None
) -> list[PerformedNode]:
    """Return list of enabled defense steps in the AttackGraph

    The returned list will contain dicts with node ids and timestamps.
    """
    global performed_nodes

    if iter is not None:
        return [n for n in performed_nodes if n.iteration == iter]

    if from_iter is not None:
        return [n for n in performed_nodes if n.iteration >= from_iter]

    return performed_nodes

@mal_app.post("/performed_nodes")
async def upload_performed_nodes(new_nodes: list[PerformedNode]):
    """
    Override list of performed steps with list given as argument
    """
    global performed_nodes
    performed_nodes += new_nodes
    return 'success'


@mal_app.get("/latest_attack_steps", response_model_exclude_none=True)
async def get_latest_attack_steps() -> dict[int, list[dict]]:
    """Return a json object mapping node ids to alert logs

    This endpoint only returns the attack steps active in the current
    step of the TYR Monitor and is updated each time.
    To get all active attack steps, GET /performed_attack_steps
    """
    global latest_attack_steps
    return latest_attack_steps

@mal_app.post("/latest_attack_steps", response_class=PlainTextResponse)
async def upload_latest_attack_steps(steps: dict[int, list[dict]]):
    """
    Upload dict with latest attack steps as keys
    and their alert logs as values
    """
    global latest_attack_steps
    latest_attack_steps = steps
    return 'success'


@mal_app.post("/defender_suggestions", response_class=PlainTextResponse)
async def upload_defender_suggestions(
        suggestions: dict[str, dict[int, DefenderActionSuggestion]]
    ):
    """Set defender suggestions"""
    global defender_suggestions
    defender_suggestions = suggestions
    return 'success'

@mal_app.get("/defender_suggestions")
async def get_defender_suggestions() -> dict[str, dict[int, DefenderActionSuggestion]]:
    """Return latest defender suggestions as list of json objects"""
    global defender_suggestions
    return defender_suggestions


@mal_app.get("/defender_action")
async def get_selected_defender_action() -> DefenderActionChoice:
    """Return selected defender action/step as a json object"""
    global selected_defender_action
    return selected_defender_action

@mal_app.post("/defender_action", response_class=PlainTextResponse)
async def select_defender_action(action: DefenderActionChoice):
    """Select defender suggestion as next action for defender"""
    global selected_defender_action
    selected_defender_action = action
    return 'success'


@mal_app.get("/reward_value")
async def get_reward_value() -> RewardValue:
    """Return reward value for iteration as a json object"""
    global reward_value
    return reward_value

@mal_app.post("/reward_value", response_class=PlainTextResponse)
async def set_reward_value(value: RewardValue):
    """Set the reward value for the latest iteration"""
    global reward_value
    reward_value = value
    return 'success'


@mal_app.post("/reset", response_class=PlainTextResponse)
async def reset():
    """Reset to initial state"""
    global serialized_model, serialized_attack_graph, performed_nodes,\
        latest_attack_steps, defender_suggestions, selected_defender_action,\
        reward_value

    serialized_model = SerializedMalModel(metadata={}, assets={})
    serialized_attack_graph = (
        SerializedMalAttackGraph(attack_steps={})
    )
    performed_nodes = []
    latest_attack_steps = {0: []}
    defender_suggestions = {}
    selected_defender_action = DefenderActionChoice(
        iteration=-1, node_id=None
    )
    reward_value = RewardValue(iteration=-1, reward=0.0)
    return 'success'

if __name__ == "__main__":
    # Start the FastAPI app with uvicorn
    uvicorn.run(mal_app, host="0.0.0.0", port=8888, root_path="")
