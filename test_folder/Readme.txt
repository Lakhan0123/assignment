Hi Team,

The following project is developed to extract data from wikipedia the data would consist
import and export main countries for all the countries.

We use node js module called puppeteer to develop this project.
we also use fileSystem or fs module 
We store the data in CSV format in file name called "export_import"


Algorithm we use to extract the data is

1) we navigate to wikipedia page which consists of list of contries by GDP.
2) we store the country name and corresponding urls in an object.
3) After storing the object into a list we navigate to each url link of object.
4) we use XPaths and selectors to fetch the data from each url page.
5) Finally we format and store the data in CSV file.