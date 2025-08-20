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

export interface IMochawesomeReport{
  stats: IStats;
  results: IResult[];
  meta: IMeta;
}

export interface IStats {
  suites: number;
  tests: number;
  passes: number;
  pending: number;
  failures: number;
  start: string; // ISO date string
  end: string;   // ISO date string
  duration: number;
  testsRegistered: number;
  passPercent: number;
  pendingPercent: number;
  other: number;
  hasOther: boolean;
  skipped: number;
  hasSkipped: boolean;
}

export interface IResult {
  uuid: string;
  title: string;
  fullFile: string;
  file: string;
  beforeHooks: IHook[];
  afterHooks: IHook[];
  tests: ITest[];
  suites: ISuite[];
  passes: string[];
  failures: string[];
  pending: string[];
  skipped: string[];
  duration: number;
  root: boolean;
  rootEmpty: boolean;
  _timeout: number;
}

export interface IHook {
  title?: string;
  fullTitle?: string;
  timedOut?: boolean | null;
  duration?: number | null;
  state?: string;
  pass?: boolean;
  fail?: boolean;
  pending?: boolean;
  code?: string;
  err?: Record<string, unknown>;
  uuid?: string;
  parentUUID?: string;
  isHook?: boolean;
  skipped?: boolean;
}

export interface ITest {
  title: string;
  fullTitle: string;
  timedOut: boolean | null;
  duration: number;
  state: "passed" | "failed" | "pending";
  speed: string;
  pass: boolean;
  fail: boolean;
  pending: boolean;
  context: string | null;
  code: string;
  err: Record<string, unknown>;
  uuid: string;
  parentUUID: string;
  isHook: boolean;
  skipped: boolean;
}

export interface ISuite {
  uuid: string;
  title: string;
  fullFile: string;
  file: string;
  beforeHooks: IHook[];
  afterHooks: IHook[];
  tests: ITest[];
  suites: ISuite[];
  passes: string[];
  failures: string[];
  pending: string[];
  skipped: string[];
  duration: number;
  root: boolean;
  rootEmpty: boolean;
  _timeout: number;
}

export interface IMeta {
  mocha: {
    version: string;
  };
  mochawesome: {
    options: {
      quiet: boolean;
      reportFilename: string;
      saveHtml: boolean;
      saveJson: boolean;
      consoleReporter: string;
      useInlineDiffs: boolean;
      code: boolean;
    };
    version: string;
  };
  marge: {
    options: {
      reportDir: string;
      overwrite: boolean;
      html: boolean;
      json: boolean;
      saveJson: boolean;
      reportFilename: string;
      embeddedScreenshots: boolean;
      inlineAssets: boolean;
    };
    version: string;
  };
}
