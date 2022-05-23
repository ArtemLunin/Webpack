import * as $ from 'jquery'
import Post from '@models/Post'
import './babel'
import './styles/styles.css'
import './styles/less.less'
import "./styles/scss.scss";
import json from './assets/json'
import WebpackLogo from './assets/webpack-logo'

const post = new Post("Webpack Post Title", WebpackLogo);

$('pre').addClass('code').html(post.toString());

console.log("JSON:", json);