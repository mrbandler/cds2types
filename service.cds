using { managed } from '@sap/cds/common';

service TestService {
    function greet() returns String;
    function foo(bar: String) returns String;
    action bar(foo: String);

    type Gender: String enum { male = 'male'; female = 'female' };
    type EnumTest: String enum { one; two; };

    type UserContext {
        Username: String;
        Email: String;
        Firstname: String;
        Lastname: String;
        Fullname: String;
        Roles: array of String;
        Scopes: array of String;
    }

    entity Foo: managed {
        key FooId: UUID;
        VInlineEnum: Integer enum {
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
        Bar: Association to one Bar on Bar.BarString = $self.FooString;
    };

    entity Bar: managed {
        BarString: String;
        Foo: Association to Foo;
    }

    entity Test: managed, Inher {
        Test: String;
    }

    entity Inher {
        InherTest: String;
    }
}