import { App, CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, Table, BillingMode } from 'aws-cdk-lib/aws-dynamodb';

/**
 * Immutable infrastructure - things that, if destroyed, WILL lose state.
 * 
 * This includes DynamoDB.
 * 
 * Exports DDB Name and Arn for cross-stack references.
 */
export class InceptionHealthImmutable extends Stack {
    constructor(app: App, id: string) {
        super(app, id);

        /**
         * Creates an On-Demand DynamoDB Table with a Partition Key of "id"
         */
        const ddb = new Table(this, 'InceptionHealthDDB', {
            partitionKey: {
              name: 'id',
              type: AttributeType.STRING
            },
            tableName: 'checkins',
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
          });
        
        /**
         * Outputs DDB Arn and Name for cross-stack references.
         */
        new CfnOutput(this, 'ExportInceptionHealthDDBArn', { exportName: 'ExportInceptionHealthDDBArn', value: ddb.tableArn })
        new CfnOutput(this, 'ExportInceptionHealthDDBName', { exportName: 'ExportInceptionHealthDDBName', value: ddb.tableName })
    }
}