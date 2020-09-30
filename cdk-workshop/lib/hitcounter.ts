import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface HitCounterProps {
    // INFO: the function for which we want to count URL hits
    downstream: lambda.IFunction;
}

export class HitCounter extends cdk.Construct {

    // INFO: allows accessing the counter function
    public readonly handler: lambda.Function;


    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        super(scope, id)

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING }
        });

        this.handler = new lambda.Function(this, 'HitCounterHandler', {
            runtime: lambda.Runtime.NODEJS_10_X,
            handler: 'hitcounter.handler',
            code: lambda.Code.fromAsset('lambda'),
            environment: {
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HITS_TABLE_NAME: table.tableName
            }
        });

        // INFO: grant the lambda role read/write permissions to the table
        table.grantReadWriteData(this.handler);

        // INFO: grant the lambda role invoke permissions to the downstream function
        props.downstream.grantInvoke(this.handler);
    }
}