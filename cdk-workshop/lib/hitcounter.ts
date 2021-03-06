import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { RemovalPolicy } from '@aws-cdk/core';

export interface HitCounterProps {
    // INFO: the function for which we want to count URL hits
    downstream: lambda.IFunction;

    /**
     * The read capacity units for the table
     *
     * Must be greater than 5 and less than 20
     *
     * @default 5
    */
    readCapacity?: number;
}

export class HitCounter extends cdk.Construct {

    // INFO: allows accessing the counter function
    public readonly handler: lambda.Function;

    // INFO: allows accessing the hit counter
    public readonly table: dynamodb.Table;


    constructor(scope: cdk.Construct, id: string, props: HitCounterProps) {
        if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
            throw new Error('readCapacity must be greater than 5 and less than 20');
        }
        super(scope, id)

        const table = new dynamodb.Table(this, 'Hits', {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            removalPolicy: RemovalPolicy.DESTROY,
            readCapacity: props.readCapacity || 5
        });
        this.table = table;

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