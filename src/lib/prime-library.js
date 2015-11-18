PrimeLibrary = (function() {
	/**
	 * Static methods to deal with prime numbers
	 * @class PrimeLibrary
	 */
	var PrimeLibrary = {};
	var checkType = function(value, type) {
		if (typeof value !== type) {
			throw "It should be a " + type + ": " + value;
		}
		return value;
	};
	var checkIsNumber = function(value) {
		return checkType(value, 'number');
	};
	var checkIsInt = function(value) {
		checkIsNumber(value);
		if (value % 1 !== 0) {
			throw "It should be an int: " + value;
		}
		return value;
	};

	/**
	 * @static
	 * @method leastFactor
	 * @returns {Number} the smallest prime that divides n
	 */
	PrimeLibrary.leastFactor = function(n) {
		checkIsInt(n);
		if (n === 0)
			return 0;
		if (n === 1)
			return 1;
		if (n % 2 === 0)
			return 2;
		if (n % 3 === 0)
			return 3;
		if (n % 5 === 0)
			return 5;
		var m = Math.sqrt(n);
		for (var i = 7; i <= m; i += 30) {
			if (n % i === 0)
				return i;
			if (n % (i + 4) === 0)
				return i + 4;
			if (n % (i + 6) === 0)
				return i + 6;
			if (n % (i + 10) === 0)
				return i + 10;
			if (n % (i + 12) === 0)
				return i + 12;
			if (n % (i + 16) === 0)
				return i + 16;
			if (n % (i + 22) === 0)
				return i + 22;
			if (n % (i + 24) === 0)
				return i + 24;
		}
		return n;
	};

	/**
	 * @static
	 * @method isPrime
	 * @returns {Boolean} true if n is prime
	 */
	PrimeLibrary.isPrime = function(n) {
		checkIsInt(n);
		return n === PrimeLibrary.leastFactor(n);
	};

	/**
	 * @static
	 * @method factor
	 * @returns {Array} the prime factorization of n
	 */
	PrimeLibrary.factor = function(n) {
		checkIsInt(n);
		if (n < 0) {
			throw 'n should be positive';
		}
		var result = [];
		do {
			minFactor = PrimeLibrary.leastFactor(n);
			result.push(minFactor);
			n /= minFactor;
		} while (n != 1);
		return result;
	};

	/**
	 * @static
	 * @method nextPrime
	 * @returns {Number} the smallest prime greater than n
	 */
	PrimeLibrary.nextPrime = function(n) {
		checkIsInt(n);
		if (n < 2)
			return 2;
		for (var i = n + 1; i < 9007199254740992; i++) {
			if (PrimeLibrary.isPrime(i))
				return i;
		}
		return NaN;
	};

	return PrimeLibrary;
})();
