import { App } from 'aws-cdk-lib';
import { InceptionHealthMutable } from './mutable';
import { InceptionHealthImmutable } from './immutable';

const app = new App()

// Creates both mutable and immutable stacks.
new InceptionHealthImmutable(app, "InceptionHealthImmutable");
new InceptionHealthMutable(app, "InceptionHealthMutable");

app.synth();
