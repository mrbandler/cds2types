using { managed } from '@sap/cds/common';

service TestService {
    function foo(bar: String) returns String;
    action bar(foo: String);

    type Gender: String enum { male = 'male'; female = 'female' };
    type EnumTest: String enum { one; two; };

    entity Foo: managed {
        key FooId: UUID;
        FooInlineEnum: Integer enum {
            BarOne = 1;
            BarTwo = 2;
            BarThree = 3;
        };
        FooBool: Boolean;
        FooEnum: Gender;
        FooDate: Date;
        FooTimestamp: Timestamp;
        FooDateTime: DateTime;
        FooString: String;
        FooStringArray: array of String;
        FooDouble: Double;
        FooInteger: Integer;
        virtual FooDecimal: Decimal(10,3);
    };
}