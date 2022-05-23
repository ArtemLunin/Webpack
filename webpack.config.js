const path = require('path')
// добавляем плагин
const HTMLWebpackPlugin = require('html-webpack-plugin')
// очищает предыдущее содержимое dist
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// минифицирование css, html
const cssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')
// минифицирование js кода
const terserWebpackPlugin = require('terser-webpack-plugin')

//определяем среду запуска (настраивается в package.json)
const isDev = process.env.NODE_ENV === "development"
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    }
  }
  // для прода - добавляем опции минифицирования
  if (isProd) {
    config.minimizer = [
      new cssMinimizerWebpackPlugin(),
      new terserWebpackPlugin()
    ]
  }

  return config
}

// для dev - нормальные имена, для prod - с хешами
const filename = (ext) =>
  isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const cssLoaders = extra => {
 const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {},
    },
    "css-loader",
    // "less-loader",
  ]

  if (extra) {
    loaders.push(extra)
  }
  return loaders
}

const jsLoaders = () => {
  const loaders = [{
    loader: "babel-loader",
    options: {
      presets: ["@babel/preset-env"],
    }
  }]

  if (isDev) {
    loaders.push('eslint-loader')
  }
  return loaders
}

module.exports = {
  // место хранения исходников, все из папки entry будет отталкиваться от него
  context: path.resolve(__dirname, "src"),
  // режим разработки по умолчанию
  mode: "development",
  // исходник (объект или простая строка)
  entry: {
    main: [
      // подключаем полифил
      "@babel/polyfill",
      "./index.js"]
      ,
    analytics: "./analytics.js",
  },
  output: {
    // имя файла, в [] - можем указать шаблон имени
    // [contenthash] - динамический хеш для имени
    filename: filename("js"),
    // путь сохранения
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    // расширения по умолчанию
    extensions: [".js", ".json", ".png"],
    // при импорте можно указывать @models, подставится путь
    alias: {
      "@models": path.resolve(__dirname, "src/models"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  //если сторонний пакет импортируется в разных местах, то с этой опицей будет создан отдельный js-файл
  optimization: optimization(),
  // запуск локального сервера
  devServer: {
    port: 4200,
    static: "./src",
    hot: isDev,
    open: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      // title будет передан в документ HTML
      // если задан template, то title игнорируется
      title: "Webpack Vladilen",
      //   исходный HTML-файл
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    // прямое копирование файлов
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/favicon.ico"),
          to: path.resolve(__dirname, "dist"),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
  ],
  module: {
    rules: [
      {
        // что делать для файлов не JS
        // regexp
        test: /\.css$/,
        //   что использовать, правила работают справа-налево. сначала css-loader...
        // style-loader добавляет стили в head HTML
        // use: ["style-loader", "css-loader"],
        // 2-й вариант через плагин, который сохранит css в отдельном файле
        use: cssLoaders(),
      },
      {
        test: /\.less$/,
        use: cssLoaders("less-loader"),
      },
      {
        test: /\.s[ac]ss$/,
        use: cssLoaders("sass-loader"),
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        type: "asset/resource",
      },
      {
        test: /\.(ttf|woff|woff2|eot)/,
        type: "asset/resource",
        //   use: ['file-loader']
      },
    ],
  },
};