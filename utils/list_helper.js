const _ = require('lodash');

const dummy = (blogs) => {
    return 1
  }

const totalLikes = (blogs) => {
    const likes = blogs.map ( blog => blog.likes)

    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    return (
        likes.length === 0 ? 0 : likes.reduce(reducer))
}


const favoriteBlog = (blogs) => {
    return (
    blogs.length === 0 ? 
    "No blogs entered yet" : 
    blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)
        )
}

const mostBlogs = (blogs) => {

if (blogs.length === 0 ) {
    return "No blogs entered yet"
}
const arr = blogs.map (ele => ele.author)

const countObject = _.countBy(arr) // turns array into an object with counts {"author" : 3, "author": 2}
const countArr = _.toPairs(countObject) //turns the object in an array [["author":3], ["auther":2]]
const resultArr = _.maxBy(countArr, _.last) //gets the array w/ the max count 

const result = {   //turns it back into an object
  author: resultArr[0],
  blogs: resultArr[1]

}
return(result)
}

const mostLikes = (blogs) => {
    if (blogs.length === 0 ) {
        return "No blogs entered yet"
    }
const arr = []
blogs.forEach (ele => { 
arr.push (_.pick(ele, ['author', 'likes']))
}
)

const output =
  _(arr)
    .groupBy('author')
    .map((objs, key) => ({
        'author': key,
        'likes': _.sumBy(objs, 'likes') }))
    .value()

    
const result = output.reduce((prev, current) => (prev.likes > current.likes) ? prev : current)

return (result);
}


  module.exports = {
    dummy,
    totalLikes, 
    favoriteBlog, 
    mostBlogs, 
    mostLikes
  }