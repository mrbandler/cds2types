using {sap.capire.bookshop as my} from '../db/schema';

service CatalogService @(path : '/browse') {

    entity ServiceEntity {
        key id           : UUID;
            arrayComplex : array of arrayParameterType;
            arraySimple  : array of String;
    }

    entity ArrayUsingEntity as projection on my.ArrayUsingEntity;

    @readonly
    entity Books            as
        select from my.Books {
            *,
            author.name as author,
            virtual 1   as isStockVisible : hana.TINYINT
        }
        excluding {
            createdBy,
            modifiedBy
        }

        actions {
            action   addRating(stars : Integer);
            function getViewsCount() returns Integer;
        }

    function getBooks(author : my.Authors:ID)                                                                                          returns array of Books;
    action   unboudAction(simpleParameter : String, arrayParameter : array of arrayParameterType, typedParameter : typedParameterType) returns ActionReturnType;

    @requires_ : 'authenticated-user'
    action   submitOrder(book : Books:ID, amount : Integer);


    type arrayParameterType : {
        value : String;
    }

    type typedParameterType : {
        value : String;
    }

    type ActionReturnType : {
        success : Boolean;
    }

}
