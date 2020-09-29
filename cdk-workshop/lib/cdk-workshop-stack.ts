import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // INFO: define AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_10_X, // INFO: execution environment
      code: lambda.Code.fromAsset('lambda'), // INFO: code assets from lambda directory
      handler: 'hello.handler' // INFO: file is "hello", function is "handler"
    });
  }
}
