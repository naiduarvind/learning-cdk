import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // INFO: defines AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_10_X, // INFO: execution environment
      code: lambda.Code.fromAsset('lambda'), // INFO: code assets from lambda directory
      handler: 'hello.handler' // INFO: file is "hello", function is "handler"
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });

    // INFO: defines an API Gateway REST API resource backed by our 'hello' function
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    new TableViewer(this, 'ViewHitCount', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits'
    });
  }
}
