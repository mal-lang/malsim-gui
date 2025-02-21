export interface AttackStepRelatedNodes {
  id: string;
  name: string;
}

export interface AttackStepTTC {
  type: string;
  name: string;
  arguments: any[]; //Could be configured
}

export interface AttackStepInformation {
  id: number;
  type: string;
  name: string;
  ttc?: AttackStepTTC;
  children: AttackStepRelatedNodes[];
  parents: AttackStepRelatedNodes[];
  compromised_by: [];
  asset: string;
  defense_status: string;
  is_viable: string;
  is_necessary: string;
  tags: string;
  logs?: any[];
}

export interface AttackStep {
  id: string;
  information: AttackStepInformation;
}

export interface AttackGraph {
  attackSteps: AttackStep[];
}
