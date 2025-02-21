export interface AttackStepInformation {
  _index: string;
  _id: string;
  _score: number;
  _source: Object; //Could be expanded
}

export interface AttackStep {
  id: number;
  information: AttackStepInformation;
}

export interface AttackGraph {
  attackSteps: AttackStep[];
}
