module("RH Tests");

test("binarySearch", function() {

	function testBinarySearch(a, key, expected) {
		var result = RH.binarySearch(a, key);
		equal(result, expected, key + " in [" + a + "] gives: " + expected);
	}
	var array = [ 1, 2, 3 ];

	testBinarySearch(array, 0, -1);
	testBinarySearch(array, 1, 0);
	testBinarySearch(array, 2, 1);
	testBinarySearch(array, 3, 2);
	testBinarySearch(array, 4, 2);

	var array2 = [ 0, 10, 20, 30 ];

	testBinarySearch(array2, 0, 0);
	testBinarySearch(array2, 5, 0);
	testBinarySearch(array2, 10, 1);
	testBinarySearch(array2, 15, 1);
	testBinarySearch(array2, 20, 2);
	testBinarySearch(array2, 25, 2);
	testBinarySearch(array2, 30, 3);
	testBinarySearch(array2, 35, 3);
	
	var array3 = [10,20,120,220,320,420,440,460,560,660,760];
	testBinarySearch(array3, 675.9780231211334, 9);
	
	
	
});

test("divide", function() {

	function testDivide(dividend, divisor, expectedQuotient, expectedRest) {
		var result = RH.divide(dividend, divisor);
		var message = dividend + "/" + divisor + " = " + expectedQuotient + " + " + expectedRest;
		equal(result.quotient, expectedQuotient, message);
		equal(result.rest, expectedRest);
	}
	testDivide(2.5, 2, 1, 0.5);
	testDivide(2, 2, 1, 0);
	testDivide(3.5, 5, 0, 3.5);
	testDivide(0, 5, 0, 0);
});

test("Preconditions.checkInt", function() {
	var Preconditions = RH.Preconditions;
	equal(Preconditions.checkIsInt(1), 1);
	equal(Preconditions.checkIsInt(0), 0);
	equal(Preconditions.checkIsInt(-1), -1);
	throws(function() {
		Preconditions.checkIsInt(1.5);
	}, 'a double throws an exception');
	throws(function() {
		Preconditions.checkIsInt(null);
	}, 'null throws an exception');
});

test("Preconditions.checkArrayType", function() {
	var Preconditions = RH.Preconditions;
	var CustomClass = function() {
	};
	Preconditions.checkArrayType([ new CustomClass(), new CustomClass() ], CustomClass);
	throws(function() {
		Preconditions.checkArrayType([ new CustomClass(), "string" ], CustomClass);
	});
	throws(function() {
		Preconditions.checkArrayType(new CustomClass(), CustomClass);
	});
});
