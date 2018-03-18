module.exports = {
  

			 
			checkInput: function checkInput(data){

            function strip_tags (str, allow) {

            // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
            allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');

            const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
            const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

            return str.replace(commentsAndPhpTags, '').replace(tags, ($0, $1) => {

              return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';

            });

          } // strip taggs ends


          function stripslashes(str) {

           return str.replace(/\\'/g,'\'').replace(/\"/g,'"').replace(/\\\\/g,'\\').replace(/\\0/g,'\0');

          } // strip slashes ends

				const check1 = data.trim(); // strip spaces,tabs, nline etc.
				const check2 = stripslashes(check1);
				const checkReady = strip_tags(check2);

				return checkReady;

			} // input checker ends
};
