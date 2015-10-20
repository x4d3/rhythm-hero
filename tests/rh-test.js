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