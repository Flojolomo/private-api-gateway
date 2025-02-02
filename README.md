# Private API Gateway

This project investigates what is required to spin up and communicate with a private REST API Gateway. To do so, the following steps are taken

1. Spin up a VPC with private isolated subnet
2. Launch a EC2 instance in the private isolated subnet
3. Make sure that SSM session manager can connect to the EC2 instance
4. Set up API gateway with a mock response
5. Connect to the EC2 instance in private isolated subnet
6. Run `curl` with the URL displayed as CDK output
7. Receive the response

```json
{
  "id": "22af58b7-4e0e-417e-875c-413cbca93363",
  "createdAt": 1720824133164,
  "updatedAt": 1720824133164,
  "message": "Hello, from a private API!"
}
```

## Deployment

This application is implemented using CDK. To deploy the application run `yarn cdk deploy`

## Learnings

### Session Manager

The connection of session manager to the EC2 instance failed with an empty console & a hung up CLI. According to the documentation, the set up requires VPC interface endpoints for `ssm`, `ssmmessages` & `ec2messages`.
What I forgot to consider were the SSM preferences configured for my AWS certification. That configuration can be reviewed by running ` aws ssm get-document --name SSM-SessionManagerRunShell`, opening the [AWS SSM Documents console](https://console.aws.amazon.com/systems-manager/documents/SSM-SessionManagerRunShell/content), or reviewing the [session manager preferences](https://console.aws.amazon.com/systems-manager/session-manager/preferences). The state of my account is listed at the bottom of the section and sets up CloudWatch logging & S3 logging. Since there were no VPC endpoint for `s3` & `logs` configured, sending those logs failed and caused the connecting to fail establishing. The same applies for Run Commands and other SSM features.

```json
// SSM Document SSM-SessionManagerRunShell
{
  "Name": "SSM-SessionManagerRunShell",
  "CreatedDate": "<>",
  "DocumentVersion": "1",
  "Status": "Active",
  "Content": {
    "schemaVersion": "1.0",
    "description": "Document to hold regional settings for Session Manager",
    "sessionType": "Standard_Stream",
    "inputs": {
      "s3BucketName": "<>"
      "s3KeyPrefix": "session-manager",
      "s3EncryptionEnabled": false,
      "cloudWatchLogGroupName": "<>",
      "cloudWatchEncryptionEnabled": false,
      "idleSessionTimeout": "20",
      "maxSessionDuration": "",
      "cloudWatchStreamingEnabled": true,
      "kmsKeyId": "",
      "runAsEnabled": false,
      "runAsDefaultUser": "",
      "shellProfile": { "windows": "", "linux": "" }
    }
  },
  "DocumentType": "Session",
  "DocumentFormat": "JSON"
}
```

## References

[Troubleshooting blank screen for systems manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-troubleshooting.html#session-manager-troubleshooting-start-blank-screen)

[Configuration of SSM preferences](https://docs.aws.amazon.com/systems-manager/latest/userguide/getting-started-configure-preferences-cli.html)

https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-private-api-create.html#apigateway-private-api-set-up-resource-policy

https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html
https://dev.to/wojciechmatuszewski/mocking-api-endpoints-with-amazon-api-gateway-mock-integration-1h65

## TODOs

- how does the document look like for new accounts?
- create construct for SSM session manager connectable instance in private subnets, depending on SSM preferences with a custom resource
