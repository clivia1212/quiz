<template>
  <!-- <div class="quiz" v-if="data">
    <div class="result" v-if="user">
      <img :src="user.headimgurl" alt="">
      <h3>你好 {{user.nickname}}</h3>
    </div>
    <div v-if="data.length !== 0">
      <div
        v-for="item in data"
        :key="item.question"
        v-show="item.show"
        class="animated fadeInLeft list"
      >
        <p class="fadeInLeft fadeOutDown">{{item.question}}</p>
        <cube-radio-group
          v-model="item.result"
          :options="item.options"
          ...
        >
          ...
        </cube-radio-group>
      </div>
    </div>
  </div> -->

  <div v-if="!showResult">
    <h3>请答题</h3>

    <div class="container">
      <div class="itemWrapper" :style="transformX">
        <div class="item" v-for="(item, iIndex) in data" :key="item.id">
          <div class="title">第{{iIndex + 1}}题：{{item.question}}</div>
          <ul>
            <li
              v-for="(option, oIndex) in item.options"
              :key="option"
              :data-index="oIndex"
              :class="oIndex === item.result ? 'active' : ''"
              v-on:click="changeAnswer"
            >
              {{option}}
            </li>
          </ul>
        </div>
      </div>
      <div>
        <button v-if="currentQues > 0" v-on:click="prev">上一题</button>
        <button v-if="currentQues < maxQues - 1" v-on:click="next">下一题</button>
        <button v-if="currentQues === maxQues - 1" @click="getScore">得分</button>
      </div>
    </div>
  </div>
  <div v-else>
    恭喜你获得{{score}}分！
  </div>
</template>

<script>
import axios from 'axios';

axios.interceptors.request.use(
  config => {
    const token = window.localStorage.getItem('token');
    if (token) {
      config.headers.common['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
)

export default {
  data() {
    return (
      {
        data: [
          {
            id: 1,
            question: '荷兰的风车主要用于?',
            options: ['排水', '发电', '观光'],
            answer: 0,
          },
          {
            id: 2,
            question: '被称为“万园之园”的是指?',
            options: ['苏州园林', '圆明园', '乔家大院'],
            answer: 1,
          },
          {
            id: 3,
            question: '电脑的中央处理器英文简写?',
            options: ['ABU', 'CPU', 'GPU'],
            answer: 1,
          },
          {
            id: 4,
            question: '一次性筷子的发明者?',
            options: ['日本人', '美国', '中国人'],
            answer: 0,
          },
          {
            id: 5,
            question: '“匈奴未灭，何以家为”是谁的豪言?',
            options: ['岳飞', '卫青', '霍去病'],
            answer: 2,
          }
        ],
        currentQues: 0,
        // answers: [],
        showResult: false,
        sumRight: 0,
        sumScore: 0,
      }
    );
  },
  computed: {
    transformX: function() {
      console.log('this.currentQues', this.currentQues)
      const _translateX = this.currentQues > -1 ? `-${this.currentQues * 100}%` : 0;
      console.log(`transform: translateX(${_translateX})`);
      return `transform:translateX(${_translateX})`;
    },
    maxQues() {
      return this.data.length;
    }
  },
  
  async mounted() {
    const score = getQueryString('score');
    if (score) {
      this.shareData = {
        score: getQueryString('score'),
        headimgurl: getQueryString('headimgurl'),
        nickname: getQueryString('nickname'),
      };
      return;
    }
    const token = getQueryString('token');
    if (token) {
      window.localStorage.setItem('token', token);

      this.user = await this.getUser();
      this.data = await this.getData();
      this.getJSConfig();
    } else {
      this.auth();
    }
  },
  methods: {
    changeAnswer(e) {
      console.log(e, 'e')
      const { index } = e.target.dataset;
      console.log(index, 'index');
      // const newAnswers = JSON.parse(JSON.stringify(this.answers));
      // newAnswers[this.currentQues] = Number(index);
      // this.answers = newAnswers;
      // console.log(this.answers, 'this.answers')

      const newData = JSON.parse(JSON.stringify(this.data));
      newData[this.currentQues].result = Number(index);
      this.data = newData;
      console.log(this.data, 'this.data')
    },
    next() {
      this.step(1);
    },
    prev() {
      this.step(-1);
    },
    step(gap) {
      this.currentQues += gap;
    },
    // getResult() {
    //   const perQues = 20;
    //   const results = [];
    //   let sumRight = 0;

    //   this.answers.forEach((a, index) => {
    //     const answer = this.data[index].answer;
    //     const isRight = a === answer;
    //     if (isRight) sumRight +=1;
    //     results.push({
    //       isRight: a === answer,
    //       userAnswer: a,
    //       answer,
    //     });
    //   });
    //   this.sumRight = sumRight;
    //   this.sumScore = sumRight * perQues;
    //   this.showResult = true;
    //   // return { sumRight, results }
    // },

    getScore() {
      this.showResult = true;
      this.score = this._score();
    },

    _score() {
      let sum =
        this.data &&
        this.data.reduce((sum, item) => {
          if (item.result === item.answer) {
            return ++sum;
          }
          return sum;
        }, 0);
        return ((sum / this.data.length) * 100).toFixed(0);
    },

    reset() {
      this.data.forEach(v => v.result = '');
      this.openid = null;
    },
    auth() {
      window.localtion.href = '/wxAuthorize';
    },
    async getUser() {
      const res = await axios.get('/getUser');
      return res.data;
    },
    async getData() {
      const res = await axios.get('/getData');
      return res.data;
    },

    async getJSConfig() {
      // console.log('wx', wx);
      const res = await axios.get('/getJSConfig', {
        params: window.location.href,
      });
      console.log(res,'res data');
      // res.data.jsApiList = [];
      const apiList = [];
      apiList.push('onMenuShareTimeline');
      apiList.push('onMenuShareAppMessage');

      res.data.jsApiList = apiList;
      res.data.debug = false;

      // window.wx.config(res.data);
      wx.config(res.data);
      // wx.ready(function() {
      //   console.log('wx ready ....');
      // });
      // wx.updateAppMessageShareData({ 
      //   title: '', // 分享标题
      //   desc: '', // 分享描述
      //   link: '', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      //   imgUrl: '', // 分享图标
      //   success: function () {
      //     // 设置成功
      //   }
      // });
    },
    setShare() {
      const url = `${window.localtion.origin}?score=${this.score}&nickname=${this.user.nickname}`;
      const shareConfig = {
        title: `我的成绩是${this.score},你不来试试`,
        link: url,
        imgUrl: this.user.headimgurl,
      };
      window.wx.onMenuShareTimeline(shareConfig);
      window.wx.onMenuShareAppMessage(shareConfig);
    }
  }
}
</script>
<style>
  body {
    margin: 0;
  }

  h3 {
    color: red;
  }

  .container {
    white-space: nowrap;
  }

  .itemWrapper {
    transition: transform .3s ease-in-out;
  }

  .item {
    display: inline-block;
    width: 100%;

  }

  li.active {
    color: red;
  }

</style>

