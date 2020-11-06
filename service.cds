using { sap.capire.bookshop as my } from './schema';
service CatalogService @(path:'/browse') {

    @readonly entity Books as SELECT from my.Books {*,
        author.name as author
    } excluding { createdBy, modifiedBy }

    actions {
        action addRating (stars: Integer);
        function getViewsCount() returns Integer;
    }

    function getBooks(tag: String) returns array of my.Books;
    function getAuthors(name: String) returns array of my.Authors;

    @requires_: 'authenticated-user'
    action submitOrder (book : Books.ID, amount: Integer);

}
