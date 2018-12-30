import test from 'ava'
import createTweet from '../lib/create-tweet'
import { parse } from 'date-fns'

test('create-tweet:type', t => {
  const tweets = ['煩悩', '反省', '抱負', '願い', 'うどん'].map(text =>
    createTweet(text, 'user1', true, parse('2018-12-31T12:00:00+09:00'))
  )

  t.deepEqual(tweets[0], {
    image: 'bonnou.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！仕掛け人さまの煩悩、精一杯お祓いさせていただきますね～♪良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[1], {
    image: 'hansei.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！己を省みることを忘れないお心がけは、きっと次の一歩に繋がります！良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[2], {
    image: 'houhu.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！胸に抱く大志へ奮励する仕掛け人さまを、私も精一杯応援させていただきます！良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[3], {
    image: 'negai.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！その願い必ずや叶うように心からお祈りさせていただきますね！良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[4], {
    image: 'default.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！仕掛け人さまのお気持ちに負けないよう、私も精一杯お祈りさせていただきます。良いお年をお迎えください～。'
  })
})

test('create-tweet:time', t => {
  const tweets = ['2018-12-31T12:00:00+09:00', '2019-01-01T01:00:00+09:00'].map(
    time => createTweet('', 'user1', true, parse(time))
  )

  t.deepEqual(tweets[0], {
    image: 'default.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！仕掛け人さまのお気持ちに負けないよう、私も精一杯お祈りさせていただきます。良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[1], {
    image: 'default.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜明けましておめでとうございます。御奉納ありがとうございます！仕掛け人さまのお気持ちに負けないよう、私も精一杯お祈りさせていただきます。'
  })
})

test('create-tweet:vote', t => {
  const tweets = [true, false].map(voted =>
    createTweet('', 'user1', voted, parse('2018-12-31T12:00:00+09:00'))
  )

  t.deepEqual(tweets[0], {
    image: 'default.jpg',
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！仕掛け人さまのお気持ちに負けないよう、私も精一杯お祈りさせていただきます。良いお年をお迎えください～。'
  })

  t.deepEqual(tweets[1], {
    image: undefined,
    text:
      "@user1 ∬(*'ヮ')∬＜お参りくださって嬉しいです♪良いお年をお迎えください～。"
  })
})

test('create-tweet:hatch', t => {
  const tweet = createTweet(
    '',
    'user1',
    true,
    parse('2018-12-31T12:00:00+09:00'),
    true
  )

  t.deepEqual(tweet, {
    image: undefined,
    text:
      '@user1 ∬(*^ヮ^)∬＜御奉納ありがとうございます！お告げ頂いた想いが届くよう、私も精一杯お祈りいたします。良いお年をお迎えください～。'
  })
})
