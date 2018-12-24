# emily-bot

[![CircleCI](https://circleci.com/gh/popkirby/emily-bot-test.svg?style=svg)](https://circleci.com/gh/popkirby/emily-bot-test)

TC企画用のTwitter botです。

## 仕様

- 特定のハッシュタグに反応します
  - 「#TC企画宣伝」がツイートに含まれている場合には反応しません
- 画像に「エミリー」「投票しました」の2つの文字列が含まれていれば反応します
  - ![](https://pbs.twimg.com/media/Dux2D0iVYAUveIi.jpg)
  - 想定しているのはこの画面
- 同一アカウントへは、1時間あたり最大3回まで反応します
- ツイート内容は、事前に用意している文字列・画像のペアになります
  - 文字列のみでも可能です
  - `templates.yaml` ファイルで用意してます
