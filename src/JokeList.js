import React from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
  constructor(props) {
    super(props);
    this.numJokesToGet = 10;
    this.state = { jokes: [] };
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.vote = this.vote.bind(this);
    this.resetVotes = this.resetVotes.bind(this);
  }

  componentDidMount() {
    if (!this.state.jokes || this.state.jokes.length === 0) {
      if (JSON.parse(window.localStorage.getItem("jokes"))) {
        const savedJokes = this.getFromLocalStorage();
        this.setState({jokes: savedJokes});
      } else {
        this.getJokes();
      }
    }
  }

  componentDidUpdate() {
    if (!this.state.jokes || this.state.jokes.length === 0) {
      if (JSON.parse(window.localStorage.getItem("jokes"))) {
        const savedJokes = this.getFromLocalStorage();
        this.setState({jokes: savedJokes});
      } else {
        this.getJokes();
      }
    } else {
      //the votes have been updated in state so we need to update localstorage
      this.removeFromLocalStorage();
      this.saveToLocalStorage();
    }
  }

  async getJokes() {
    let j = [...this.state.jokes];
      let seenJokes = new Set();
      try {
        while (j.length < this.numJokesToGet) {
          let res = await axios.get("https://icanhazdadjoke.com", {
            headers: { Accept: "application/json" }
          });
          let { status, ...jokeObj } = res.data;
  
          if (!seenJokes.has(jokeObj.id)) {
            seenJokes.add(jokeObj.id);
            j.push({ ...jokeObj, votes: 0 });
          } else {
            console.error("duplicate found!");
          }
        }
        this.setState({jokes: j});
        this.saveToLocalStorage();
      } catch (e) {
        console.log(e);
      }
  }

  generateNewJokes() {
    this.setState({jokes: []});
    this.removeFromLocalStorage();
  }

  saveToLocalStorage() {
    window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
  }

  getFromLocalStorage() {
    return JSON.parse(window.localStorage.getItem("jokes"));
  }

  removeFromLocalStorage() {
    window.localStorage.removeItem("jokes");
  }

  vote(id, delta) {
    this.setState({ jokes: this.state.jokes.map(j => (j.id === id ? { ...j, votes: j.votes + delta } : j)) });
  }

  resetVotes() {
    this.setState({ jokes: this.state.jokes.map(j => ({ ...j, votes: 0 })) });
  }

  render() {
    let sortedJokes = [...this.state.jokes].sort((a, b) => b.votes - a.votes);
    
    return (
      <div className="JokeList">
        <button className="JokeList-getmore" onClick={this.generateNewJokes}>
          Get New Jokes
        </button>

        {!this.state.jokes.length ?
          <div>
            <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
          </div>
        :
          sortedJokes.map(j => (
            <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={this.vote} />
          ))
        }
        <button className="JokeList-getmore" onClick={this.resetVotes}>
          Reset All Votes
        </button>
      </div>
    );
  } 
}

export default JokeList;

