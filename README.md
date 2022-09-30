# AnaVis

[![Build Status](https://travis-ci.org/learningmedia/anavis.svg?branch=master)](https://travis-ci.org/learningmedia/anavis)

AnaVis is a tool to visualize musical form.

![AnaVis](http://anavis.de/images/documentation/indexabb.png)

## Command line

AnaVis can be used as a command line utility in order to (batch) convert AnaVis files into other formats.

Usage example:

~~~shell
# Converts the specified files
anavis eject ./my-file.avd ./my-other-file.avd

# Converts all *.avd files in the specified folder
anavis eject --directory ./my-folder

# Specify the "format" option as either "json" (default) or "csv"
anavis eject --directory ./my-folder --format cvs
~~~

## License

AnaVis is released under the MIT License. See the bundled LICENSE file for details.
