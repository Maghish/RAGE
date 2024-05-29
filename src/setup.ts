#!/usr/bin/env node

interface promptFunctionReturnValues {
  projectName: string;
  dirPath: string;
  mainFile: string;
  moduleType: "commonjs" | "module";
  method: "PAI" | "POU" | "NI";
  interval?: number;
  databaseType: "MongoDB";
  databaseSecret?: string;
  mongodbDatabasedbs?: string[];
  mongodbDatabaseExcludeCollections?: string[];
  outDir: string;
}

import { input, select, Separator } from "@inquirer/prompts";
import chalk from "chalk";
import fs from "fs";
import path from "path";

/**
 * Prompts different set of questions for the user to answer and return the user's answers.
 * @returns {promptFunctionReturnValues | undefined}
 */
async function prompt() {
  try {
    // Initialize with default values
    var returnValues: promptFunctionReturnValues = {
      projectName: "",
      dirPath: ".",
      mainFile: "index.js",
      moduleType: "commonjs",
      method: "PAI",
      interval: 600000,
      databaseType: "MongoDB",
      outDir: ".",
    };

    // File setup related questions
    var projectName = await input({
      message: "Enter the application/project name:",
    });
    if (projectName && projectName !== "") {
      returnValues.projectName = projectName;

      var dirPath = await input({
        message:
          "Enter the directory path (Hit enter to proceed with default option):",
        default: ".",
      });
      if (dirPath && dirPath !== "") {
        returnValues.dirPath = dirPath;

        var mainFile = await input({
          message:
            "Enter the main file name (Hit enter to proceed with default option):",
          default: "index.js",
        });
        if (mainFile && mainFile !== "" && mainFile.endsWith(".js")) {
          returnValues.mainFile = mainFile;

          var moduleType: "commonjs" | "module" = await select({
            message: "Enter the package type:",
            choices: [
              {
                name: "commonjs",
                value: "commonjs",
              },
              {
                name: "module",
                value: "module",
              },
            ],
          });

          returnValues.moduleType = moduleType;

          // RAGE related questions
          var method: "PAI" | "POU" | "NI" = await select({
            message: "Enter which RAGE method to use for this project:",
            choices: [
              {
                name: "Push After Interval",
                value: "PAI",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#push-after-interval-%EF%B8%8F",
              },
              {
                name: "Push On Update",
                value: "POU",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#push-on-update-%EF%B8%8F",
                disabled: "(Not supported yet)",
              },
              {
                name: "No Interval",
                value: "NI",
                description:
                  "Visit this URL for docs: https://github.com/Maghish/RAGE?tab=readme-ov-file#no-interval-%EF%B8%8F",
                disabled: "(Not supported yet)",
              },
            ],
          });

          returnValues.method = method;

          if (method === "PAI") {
            var interval: string | number = await input({
              message:
                "Set the interval (Enter in milliseconds) (Hit enter to proceed with default option):",
              default: "600000",
            });

            interval = Number(interval);

            if (!interval) {
              console.log(
                chalk.red("\nPlease enter a valid value and try again!")
              );
              process.exit(1);
            } else if (interval < 5000) {
              console.log(
                chalk.red(
                  "\nThe minimum interval should be above 5000 milliseconds!"
                )
              );
              process.exit(1);
            }

            returnValues.interval = interval;
          }

          var databaseType: "MongoDB" = await select({
            message: "Select the cloud database",
            choices: [
              {
                name: "MongoDB",
                value: "MongoDB",
              },
            ],
          });

          returnValues.databaseType = databaseType;

          if (databaseType === "MongoDB") {
            var databaseSecret: string = await input({
              message: "Enter the database secret key (MongoDB URI):",
            });

            if (databaseSecret && databaseSecret !== "") {
              returnValues.databaseSecret = databaseSecret;
            } else {
              console.log(
                chalk.red(
                  "\nPlease enter the database secret key (MongoDB URI) properly and try again!"
                )
              );
              process.exit(1);
            }

            var mongodbDatabasedbs: string | string[] = await input({
              message:
                "Enter the whitelisted databases (Use ',' to seperate the values):",
            });

            mongodbDatabasedbs = mongodbDatabasedbs.split(",");
            mongodbDatabasedbs = mongodbDatabasedbs.map((e) => e.trim());

            returnValues.mongodbDatabasedbs = mongodbDatabasedbs;

            var mongodbDatabaseExcludeCollections: string | string[] =
              await input({
                message:
                  "Enter the blacklisted collections in all databases (Mention the database of the collection, e.g. 'db/col') (Use ',' to seperate the values):",
              });

            mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections.split(",");
            mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections.map((e) => e.trim());

            returnValues.mongodbDatabaseExcludeCollections =
              mongodbDatabaseExcludeCollections;
          }

          var outDir = await input({
            message:
              "Enter the directory to store the local files (Hit enter to proceed with default option):",
            default: ".",
          });

          if (outDir && outDir !== "") {
            returnValues.outDir = outDir;
          } else {
            console.log(
              chalk.red(
                "\nPlease enter the directory path properly and try again!"
              )
            );
            process.exit(1);
          }

          return returnValues;
        } else {
          console.log(
            chalk.red(
              "\nPlease enter a valid file name with .js extension and try again!"
            ) +
              chalk.yellow(
                "\nRAGE CLI doesn't support typescript nor any other files except javascript files yet."
              )
          );
          process.exit(1);
        }
      } else {
        console.log(
          chalk.red(
            "\nPlease enter the working directory properly and try again!"
          )
        );
        process.exit(1);
      }
    } else {
      console.log(
        chalk.red(
          "\nPlease enter a valid name for the application/project and try again!"
        )
      );
      process.exit(1);
    }
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red("\nUnexpected error occured!"));
      process.exit(1);
    } else {
      console.log(chalk.redBright("\nTerminating process..."));
      process.exit(1);
    }
  }
}

/**
 * Function which creates all the files with the given information
 * @param {promptFunctionReturnValues}
 */
async function createFiles(configSettings: promptFunctionReturnValues) {
  // Create a directory
  if (fs.existsSync(path.join(__dirname, configSettings.dirPath))) {
  } else {
    fs.mkdirSync(path.join(__dirname, configSettings.dirPath));
    console.log("Directory created");
  }

  // Create rage.config.json file
  const rageConfigFileData = {
    method: configSettings.method,
    methodSpecificSettings: {
      interval: configSettings.interval,
    },
    database: {
      type: configSettings.databaseType,
      secretKey: configSettings.databaseSecret,
      dbSpecificSettings: {
        dbs: configSettings.mongodbDatabasedbs,
        excludeCollections: configSettings.mongodbDatabaseExcludeCollections,
      },
    },
    outDir: configSettings.outDir,
  };

  fs.writeFileSync(
    path.join(__dirname, configSettings.dirPath + "/rage.config.json"),
    JSON.stringify(rageConfigFileData, null, 2),
    "utf-8"
  );
  console.log("Created rage.config.json");

  // Write package.json
  const packageJsonData = {
    name: configSettings.projectName,
    version: "1.0.0",
    description: "",
    main: configSettings.mainFile,
    scripts: {
      start: `node ${configSettings.mainFile}`,
    },
    keywords: [],
    author: "",
    license: "ISC",
  };

  fs.writeFileSync(
    path.join(__dirname, configSettings.dirPath + "/package.json"),
    JSON.stringify(packageJsonData, null, 2),
    "utf-8"
  );
  console.log("Created package.json");

  // Write the main file
  try {
  } catch (error: any) {
    if (error.code === "ExitPromptError") {
      console.log(chalk.red("\n Unexpected error occurred!"));
    } else {
      console.log(chalk.redBright("\nTerminating process..."));
    }
  }
}

/**
 * Initial function to run on start
 */
async function start() {
  // Ask the user questions
  const res = await prompt();
  await createFiles(res);
}

start();
