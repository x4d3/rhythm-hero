module("RH Tests");

test("binarySearch", function() {
	
	function testBinarySearch(a, key, expected){
		equal(RH.binarySearch(a, key), expected, "binarySearch: " + a + ", " + key);
	}
	var array = [1,2,3];
	
	testBinarySearch(array, 0, -1);
	testBinarySearch(array, 1, 0);
	testBinarySearch(array, 2, 1);
	testBinarySearch(array, 3, 2);
	testBinarySearch(array, 4, 2);
	
	var array2 = [0,10,20,30];
	
	testBinarySearch(array2, 0 , 0);
	testBinarySearch(array2, 5 , 0);
	testBinarySearch(array2, 10, 1);
	testBinarySearch(array2, 15, 1);
	testBinarySearch(array2, 20, 2);
	testBinarySearch(array2, 25, 2);
	testBinarySearch(array2, 30, 3);
	testBinarySearch(array2, 35, 3);
});

test("divide", function() {

	function testDivide(dividend, divisor, expectedQuotient, expectedRest){
		var result = RH.divide(dividend, divisor);
		equal(result.quotient, expectedQuotient, "testDivide: " + arguments);
		equal(result.rest, expectedRest, "testDivide: " + arguments);
	}
	testDivide(2.5, 2, 1, 0.5);
	testDivide(2, 2, 1, 0);
	testDivide(3.5, 5, 0, 3.5);
	testDivide(0, 5, 0, 0);
});