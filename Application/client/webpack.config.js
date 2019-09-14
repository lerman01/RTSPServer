module.exports = {
	mode: "production",    
	entry: ['./src/index.js'],
    output: {
        filename: 'bundle.js',
        path: '/staticdata'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }, {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }
        ]
    }
};
