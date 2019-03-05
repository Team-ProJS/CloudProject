//This is a script that dropbox uses for parsing of query strings and tokens therefore DO NOT TOUCH 
(function(window){
	window.utils ={
		parseQueryString: function(str){
			var ret = Object.create(null);
			if(typeof str !== 'string'){
				return ret;
			}
			str = str.trim().replace(/^(\?|#|&)/, '');
			if(!str){
				return ret;
			}
			str.split('&').forEach(function(param){
				var parts = param.replace(/\+/g, ' ').split('=');
				var key = parts.shift();
				var val = parts.length > 0 ? parts.join('=') : undefined;
				key=decodeURIComponent(key);
				val = val === undefined ? null : decodeURIComponent(val);
				if (ret[key] === undefined) {
					ret[key] = val;
				  } else if (Array.isArray(ret[key])) {
					ret[key].push(val);
				  } else {
					ret[key] = [ret[key], val];
				  }
			});
			return ret;
		}
	};
})(window);
//END