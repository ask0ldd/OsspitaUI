export interface IComfyWorkflow {
    [key: string]: {
      inputs: {
        [key: string]: number | string | [string, number] | [string, number][] | Array<[string, number]>;
      };
      class_type: string;
      _meta: {
        title: string;
      };
    };
}