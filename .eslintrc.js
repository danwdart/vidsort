module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": "2018"
    },
    "rules": {
        "no-console": [
            0
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "backtick"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};