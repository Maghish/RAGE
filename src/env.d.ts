interface PushAfterIntervalArguments {
  interval: number;
  outDir: string;
  database: {
    type: "MongoDB";
    secretKey?: string;
    dbSpecificSettings: {
      dbs: string[];
      excludeCollections: string[];
    };
  };
}

interface writeJsonFilesArguments {
  dirPath: string;
  fileName: string;
  databaseName: string;
  dataToWrite: any[] | Object;
}

export { PushAfterIntervalArguments, writeJsonFilesArguments };
