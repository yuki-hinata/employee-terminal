import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function main() {
  const rl = readline.createInterface({
    input,
    output,
  });

  const result = await rl.question("操作を選択して下さい: [N]名前検索 [Y]勤続年数 [Q]システム終了");
  if (result === "N") {
    console.log("名前検索を実行します。");
  } else if (result === "Y") {
    console.log("勤続年数を実行します。");
  } else if (result === "Q") {
    console.log("システムを終了します。");
    rl.close();
  }
}

main();
