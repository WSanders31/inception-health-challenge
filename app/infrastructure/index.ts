import { App } from "aws-cdk-lib";
import { InceptionHealthApp } from "./app";
import { InceptionHealthDatabase } from "./database";

const app = new App();

/**
 * Creates both app and database stacks.
 * 
 * Layered architecture, separating them for finer control.
 */
new InceptionHealthDatabase(app, "InceptionHealthDatabase");
new InceptionHealthApp(app, "InceptionHealthApp");

app.synth();
