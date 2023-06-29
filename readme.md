# Inception Health Platform Challenge
## Submission by: Will Sanders
<br>

### **Getting Started**

From `/app`, run:<br>
```npm i && npm run init```<br>

I've exposed three `npm scripts` for convenience that can be run from the root of `/app`:
- `npm run init` - [bootstraps](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) cloud account, and deploys app infrastructure
- `npm run deploy` - deploys app infrastructure
- `npm run destroy` - destroys app infrastructure<br>
*All commands execute in the `us-east-1` region, by default.*<br>
### **Approach**
I decided to utilize [aws-cdk](https://github.com/aws/aws-cdk) as the *infrastructure as code* tool of choice. 

In terms of AWS services utilized, I stuck to the Serverless basics, IE: **API Gateway(v2)**, **Lambda**, and obviously, **DynamoDB**.

A new directory called **infrastructure** exists where all infrastructure related things exist.

I've split up infrastructure into two categories, mutable and immutable. This is simply to allow the deletion of infrastructure that doesn't need to be worried about loss of state. (IE. API Gateway/Lambda/EventBridge Rules vs. DynamoDB)

I exposed two endpoints on the **API Gateway**. 
- **GET /checkins** for fetching checkins via the backend function. 
- **POST /checkins** for manually invoking the checkin function.

A **Lambda** function for each:
- ***app/index.ts --> backend***
- ***app/index.ts --> checkin***

- <img width="395" alt="image" src="https://github.com/WSanders31/inception-health-challenge/assets/3769409/08e35c3b-197c-4b41-aa8a-c3aa5bbd144a">


For the `automation of Check-ins`, I took advantage of an **Event Bridge Rule** to invoke the **CheckIn Lambda** every hour.

Finally, there's a ***DynamoDB*** table with a **Partition Key** of *"id"* - with a BillingMode of ***OnDemand*** pricing.

For `IAM Role Policies` I follow the pattern of least privilege for each service.

