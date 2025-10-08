import {
  EdgeAffectedCondition,
  NodeAffectedCondition,
  RendererRule,
  RendererRuleScope,
} from 'mal-js';

//Conditions
const generalNodeCondition: NodeAffectedCondition = {
  _: 'node',
  all: true,
};

const generalEdgeCondition: EdgeAffectedCondition = {
  _: 'edge',
  all: true,
};

const networkNodeCondition: NodeAffectedCondition = {
  _: 'node',
  all: false,
  type: 'Network',
};

//General Rules
const generalNodeRule: RendererRule = {
  scope: RendererRuleScope.node,
  affectedCondition: generalNodeCondition,
  vertices: 0,
  color: 'white',
  width: 50,
  height: 50,
};

const generalEdgeRule: RendererRule = {
  scope: RendererRuleScope.edge,
  affectedCondition: generalEdgeCondition,
  color: 0xafafaf,
  width: 5,
  edgeCurveX: 0,
  edgeCurveY: 0,
};

//Secondary Rules
const networkNodeRule: RendererRule = {
  scope: RendererRuleScope.node,
  affectedCondition: networkNodeCondition,
  vertices: 8,
  color: 'blue',
  width: 80,
  height: 80,
};

//Add the rules you will use here
export const assetGraphRendererRules: RendererRule[] = [
  generalNodeRule,
  generalEdgeRule,
  networkNodeRule,
];
