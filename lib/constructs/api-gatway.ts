import { CfnOutput } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

type ApiGatewayConstructProps = {
  endpointSecurityGroup: ec2.ISecurityGroup;
  vpc: ec2.IVpc;
};
export class ApiGatewayConstruct extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: ApiGatewayConstructProps
  ) {
    super(scope, id);

    const apiEndpoint = props.vpc.addInterfaceEndpoint("api-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.APIGATEWAY,
      securityGroups: [props.endpointSecurityGroup],
    });

    const apiGatewayPolicy: iam.PolicyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.DENY,
          actions: ["execute-api:Invoke"],
          principals: [new iam.AnyPrincipal()],
          resources: ["*"],
          conditions: {
            StringNotEquals: {
              "aws:sourceVpc": props.vpc.vpcId,
            },
          },
        }),
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["execute-api:Invoke"],
          principals: [new iam.AnyPrincipal()],
          resources: ["*"],
        }),
      ],
    });

    const api = new apigateway.RestApi(this, "api-gateway", {
      policy: apiGatewayPolicy,
      endpointConfiguration: {
        types: [apigateway.EndpointType.PRIVATE],
        vpcEndpoints: [apiEndpoint],
      },
    });

    api.root.addMethod(
      "GET",
      new apigateway.MockIntegration({
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        integrationResponses: [
          {
            statusCode: "200",
            responseTemplates: {
              "application/json": `{
                    "id": "$context.requestId",
                    "createdAt": $context.requestTimeEpoch,
                    "updatedAt": $context.requestTimeEpoch,
                    "message": "Hello, from a private API!"
                }`,
            },
          },
        ],
        requestTemplates: {
          "application/json": JSON.stringify({
            statusCode: 200,
          }),
        },
      }),
      { methodResponses: [{ statusCode: "200" }] }
    );
  }
}
