import { App, CfnOutput, Fn, Stack } from "aws-cdk-lib";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";

/**
 * Mutable infrastructure - things that can be destroyed without losing any state.
 *
 * This includes Api Gateway, Lambda's, IAM Roles.
 *
 * Outputs API Url for quick consumption.
 */
export class InceptionHealthApp extends Stack {
  constructor(app: App, id: string) {
    super(app, id);

    // Api Gateway V2
    const httpApi = new HttpApi(this, "InspectionHealthApi");

    /**
     * Backend Lambda for GET endpoint
     *
     * Imports cross-stack reference of DDB Name as Lambda Env Var
     */
    const backendLambda = new NodejsFunction(this, "Backend", {
      entry: join(__dirname, "../", "index.ts"),
      handler: "backend",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DYNAMO_TABLE_NAME: Fn.importValue("ExportInceptionHealthDDBName"),
      },
    });

    /**
     *  Needs Describe and GetItem DDB access
     *
     * Imports cross-stack DDB Arn reference from immutable.ts stack
     */
    backendLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:DescribeTable", "dynamodb:GetItem"],
        resources: [Fn.importValue("ExportInceptionHealthDDBArn")],
      })
    );

    /**
     * Checkin Lambda for POST endpoint
     *
     * Imports cross-stack reference of DDB Name as Lambda Env Var
     */
    const checkinLambda = new NodejsFunction(this, "Checkin", {
      entry: join(__dirname, "../", "index.ts"),
      handler: "checkin",
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DYNAMO_TABLE_NAME: Fn.importValue("ExportInceptionHealthDDBName"),
      },
    });

    /**
     * Needs PutItem DDB access
     *
     * Imports cross-stack DDB Arn reference from immutable.ts stack
     */
    checkinLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["dynamodb:PutItem"],
        resources: [Fn.importValue("ExportInceptionHealthDDBArn")],
      })
    );

    /**
     * Creates a cron rule to automate the execution of the Checkin Lambda.
     */
    const eventRule = new Rule(this, "checkinRule", {
      schedule: Schedule.cron({ hour: "*", minute: "0" }),
    });
    eventRule.addTarget(new LambdaFunction(checkinLambda));

    // Adds API Gateway V2 GET /checkins route to backendLambda
    httpApi.addRoutes({
      path: "/checkins",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "BackendIntegration",
        backendLambda
      ),
    });

    // Adds API Gateway V2 POST /checkins route to backendLambda
    httpApi.addRoutes({
      path: "/checkins",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "BackendIntegration",
        checkinLambda
      ),
    });

    // Outputs API Url for quick consumption
    new CfnOutput(this, "API Url", {
      value: httpApi.url!,
    });
  }
}
