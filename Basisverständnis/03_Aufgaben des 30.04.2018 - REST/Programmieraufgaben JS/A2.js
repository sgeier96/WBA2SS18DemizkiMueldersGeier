function getTweets(id){
  return fetch(`https://api.twitter.com/user/${id}`)     //Anstatt + Zeichen zwischen Anführungszeichen , ${} in Backticks   (Template Literals)
  .then((response)=>{                                    //function kürzer dargestellt durch => (Arrow Functions)
    return JSON.parse(response);
  }).then((response)=>{
    return response.data;
  }).then((tweets)=>{
    return tweets.filter((tweet)=>{
      return tweet.stars > 50;
    })
  }).then((tweets)=>{
    return tweets.filter((tweet)=>{
      return tweet.rts > 50;
    })
  })
}
