export interface ITestContext {
  name: string;
  tests: string[];
}

export interface IParsedTestFile {
  fileName: string;
  filePath: string;
  describe: string;
  context: string;
  contexts: ITestContext[];
  its: string[];
  description: string;
  author: string;
}
