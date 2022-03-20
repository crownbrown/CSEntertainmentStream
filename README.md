# CSExerciseTrackerPP
React/Mongo DB Single Page Application for Tracking Exercise
Full implementation of MariaDB SQL database webapp, with Node.js/AJAX frontend. Hand-written MVC implementation rather than 3rd party installation. 

Entertainment Stream streaming niche TV series (Series) to a current user base of 1000 customers. 
Without a clearly defined relational database to track the customers, their billing information, the available episodes/series, 
as well as the genres of the series, and the members viewing history such a streaming service is not possible. A database driven 
website will record the Billing information of Members, as well as 100 TV series (3,000 episodes) of 15 Genres available for streaming. 
A TV series can have multiple genres. The database tracks and Episodes (watched) by the user. The website interface will allow the 
administrator of the database to view and search/filter the tables.


Members: Records the details of the members of our video streaming service
  ● userID* ; INT, auto-increment, not NULL, PK
  ● firstName, VARCHAR, not NULL
  ● lastName, VARCHAR, not NULL
  ● email, VARCHAR, not NULL
  ● billingID (from Billings Table), FK, INT, from Billings Table, Unique
  ● userLogIn; VARCHAR, not NULL, Unique
  ● password; VARCHAR, not NULL
  ● Relationships:
    ○ A 1:1 relationship between Members and Billings is implemented using the PK billingID from the Billings table as the FK billingID inside Members
    ○ A M:M relationship between Members and Episodes is implemented using a join table (MembersEpisodes) between Members and Episodes
    ■ 1:M relationship between Members and MembersEpisodes is implemented using the PK userID from the Member table as the FK userID inside MembersEpisodes

Billings: Records the billing detail which will be associated with members
  ● billingID*, INT, auto increment, not NULL, PK
  ● billingFullName, VARCHAR, not NULL
  ● unitNumber, VARCHAR, default NULL
  ● streetName, VARCHAR, not NULL
  ● cityName, VARCHAR, not NULL
  ● stateName, VARCHAR, not NULL
  ● zipCode, CHAR, 5 digit, not NULL
  ● creditCardNumber, INT, can be non-unique, not NULL
  ● creditCardExpiration, DATE, can be non-unique, not NULL
  ● creditCardSecurityCode, INT, can be non-unique, not NULL
  ● Relationships:
    ○ A 1:1 relationship between Members and Billings is implemented using the PK billingID from the Billings entity as the FK billingID inside Members
  
 Genres: List of genre descriptions and their associated genreID
  ● genreID*, INT, auto increment, not NULL, PK
  ● genreDescription VARCHAR, not NULL
  ● Relationships:
    ○ A M:M relationship between Series and Genres is implemented using a join table (SeriesGenres) between Series and Genres
    ■ A 1:M relationship between Genres and SeriesGenres is implemented using the PK genreID from the Genres table as the FK genreID inside SeriesGenres

Series: Records the list of TV series in the streaming service, including genre code
  ● seriesID*, INT, auto increment, not NULL, PK
  ● seriesName, VARCHAR, not NULL
  ● uploadDate, DATE, non-unique, not NULL
  ● Relationships:
    ○ A M:M relationship between Series and Genres is implemented using a join table

(SeriesGenres) between Series and Genres
  ■ A 1:M relationship between Series and SeriesGenres is implemented
  using the PK seriesID from the Series table as the FK seriesID inside

SeriesGenres
  ○ A 1:M relationship between Series and Episodes is implemented using the PK
  seriesID from the Series table as the FK seriesID inside Episodes

Episodes: Records the list of individual TV episodes in the streaming service
  ● episodeID*, INT, auto increment, not NULL, PK
  ● episodeName, VARCHAR, non-unique, not NULL
  ● episodeNumber, INT, non-unique, not NULL
  ● length, INT, running time in minutes, non-unique, not NULL
  ● uploadDate, DATE, non-unique, not NULL
  ● seriesID, INT, not NULL, FK
  ● Relationships:
    ○ A M:1 relationship between Episodes and Series is implemented using the PK seriesID from the Series table as the FK seriesID inside Episodes
    ○ A M:M relationship between Members and Episodes is implemented using a join table (MembersEpisodes) between Members and Episodes
    ■ A 1:M relationship between Episodes and MembersEpisodes is implemented using the PK episodeID from the Episodes table as the FK episodeID inside MembersEpisodes

SeriesGenres: Records the list of series and their genres as an intersection entity between Series and Genres
  ● seriesGenresID*, INT, auto increment, not NULL, PK
  ● seriesID, int, pulls from Series table, not NULL, FK
  ● genreID, int, pulls from Genres table, not NULL, FK
  ● Relationships:
    ○ A M:1 relationship between SeriesGenres and Series is implemented using the
    PK seriesID from the Series table as a FK seriesID inside SeriesGenres
    ○ A M:1 relationship between SeriesGenres and Genres is implemented using the
    PK genreID from the Genres table as a FK genreID inside SeriesGenres

MembersEpisodes: Records a list of the series a member watches as an intersection entity between Members and Episodes
  ● membersEpisodesID*, INT, auto increment, not NULL, PK
  ● viewDate, TIMESTAMP, not NULL
  ● userID, INT, not NULL, pulls from Members table, FK
  ● episodeID, INT, not Null, pulls from Episodes table, FK
  ● Relationships:
   ○ A M:1 relationship between MembersEpisodes and Episodes is implemented
  using the PK episodeID from the Episodes table as a FK episodeID inside

MembersEpisodes
  ○ A M:1 relationship between MembersEpisodes and Members is implemented
  using the PK userID from the Members table as a FK userID inside MembersEpisodes
