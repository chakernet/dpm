import {Plugin} from '@yarnpkg/core';
import {BaseCommand} from '@yarnpkg/cli';
import {Option} from 'clipanion';
import {dpmResolver} from "./dpmResolver";

class HelloWorldCommand extends BaseCommand {
  static paths = [
    [`hello`, `world`],
  ];

  name = Option.String(`--name`, `John Doe`, {
    description: `Your name`,
  });

  async execute() {
    console.log(`Hello ${this.name}!`);
  }
}

export {dpmResolver}

const plugin: Plugin = {
  hooks: {
    afterAllInstalled: () => {
      console.log(`What a great install, am I right?`);
    },
  },
  commands: [
    HelloWorldCommand,
  ],
  resolvers: [
      dpmResolver
  ]
};

export default plugin;
