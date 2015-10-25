require 'net/http'
require 'uri'

class LinkFinder
    attr_accessor :content
    
    # Do everything but write the file
    def initialize
        @content = "<?xml version=\"1.0\"?> \n<directories>"
    end
    
    
    # Loads the web page, returns it as a string
    def pageLoader(url)
        
        uri = URI(url)
        contents = Net::HTTP.start(uri.host, uri.port) do |http|
            request = Net::HTTP::Get.new uri
            response = http.request(request) # Net::HTTPResponse object
        end
        
        
        return contents.body
    end

    def extract(url='http://wfs.sbcc.edu/Departments/LRC/computerlabonlineresources/dlas/', depth=1)
        # Extract the linked files and directories
        
        page = self.pageLoader(url)
        
    
        # Lambda for setting up the hash
        hash_load = lambda do |line|
            line = line.scan(/\/([^\/]*[a-z|A-Z|0-9])/)
            return line[line.length - 1]
        end
        
        # Lambda for writing tabs
        depth_tab = lambda do 
            content << "\n"
            depth.times {|num| content << "\t"} 
        end
    
        #collect the data from the files
        dir_hrefs = page.scan(/<A\s+(?:[^>]*?\s+)?HREF=([^"]*\/)>/)
        file_hrefs = page.scan(/<A\s+(?:[^>]*?\s+)?HREF=([^"]*\.[a-z|A-Z]+)>/)
        dir_hash = {}
        file_hash = {}
    
        # Put dir and file data into hashes. Can't sort hash with this ruby
        dir_hrefs.each {|h| dir_hash['http://wfs.sbcc.edu' + h[0]] = hash_load.call(h[0])}
        file_hrefs.each {|h| file_hash['http://wfs.sbcc.edu' + h[0]] = hash_load.call(h[0])}
    
        # Need arrays for sorting, hash will still be useful.
        dir_ary = []
        file_ary = []
        dir_hrefs.each{|key, value| dir_ary.push('http://wfs.sbcc.edu' + key)}
        dir_ary.delete_at(0) #get rid of prev link
        file_hrefs.each{|key, value| file_ary.push('http://wfs.sbcc.edu' + key)}
        
    
        # Fill content into a string then write xml file recursively
        dir_ary.each do |d|
            depth_tab.call
            content << "<dir>"
            depth_tab.call
            content << "\t<link>#{d}</link>"
            depth_tab.call
            content << "\t<name>#{dir_hash[d].to_s.slice(2..dir_hash[d].to_s.length - 3).gsub(/%20/, " ")}</name>"
            self.extract(d, depth + 1)
            depth_tab.call
            content << "</dir>" 
        end
    
        file_ary.each do |f|
            depth_tab.call
            content << "<file>"
            depth_tab.call
            content << "\t<link>#{f}</link>"
            depth_tab.call
            content << "\t<name>#{file_hash[f].to_s.slice(2..file_hash[f].to_s.length - 3).gsub(/%20/, " ")}</name>"
    
            depth_tab.call
            content << "</file>"  
        end

    end

    def writeToXml
        @content << "\n</directories>"
        File.open('dlalinks.xml', 'w') do |file|
            file.write @content
        end
    end
        
    
end

Page_Data = LinkFinder.new()
Page_Data.extract()
Page_Data.writeToXml