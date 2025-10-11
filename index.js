import inquirer from 'inquirer';

async function main() {
  const answer = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "What is your name?",
    },
  ]);
  console.log(answer);
}

main();
