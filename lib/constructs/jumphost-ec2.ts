import { InstanceClass, InstanceSize } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import { CfnOutput } from "aws-cdk-lib";

type JumphostEc2ConstructProps = {
  vpc: ec2.IVpc;
};

export class JumphostEc2Construct extends Construct {
  public constructor(
    scope: Construct,
    id: string,
    props: JumphostEc2ConstructProps
  ) {
    super(scope, id);

    const role = new iam.Role(this, "Ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    const clientInstance = new ec2.Instance(this, "TestingEC2Instance2", {
      instanceName: "client",
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage(),
      role: role,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    const privateInstance = new ec2.Instance(
      this,
      "PrivateIsolatedEC2Instance",
      {
        instanceName: "client",
        vpc: props.vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        machineImage: new ec2.AmazonLinuxImage(),
        role: role,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      }
    );

    new CfnOutput(this, "ClientInstanceId", {
      value: clientInstance.instanceId,
    });

    new CfnOutput(this, "PrivateInstanceId", {
      value: privateInstance.instanceId,
    });
  }
}
