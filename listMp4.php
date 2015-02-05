<?php
/*
Copyright 2014 Pierre Walch
pwalch.net

  This file is part of RemoteMp4Player.

    RemoteMp4Player is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    RemoteMp4Player is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with RemoteMp4Player.  If not, see <http://www.gnu.org/licenses/>.

*/

function findFilesWithExtension($extension, $searchDirectory) {
    $fileInfoIteratorIterator = new RecursiveIteratorIterator(
                                        new RecursiveDirectoryIterator(
                                            $searchDirectory,
                                            FilesystemIterator::FOLLOW_SYMLINKS));
    $fileInfoIterator = new RegexIterator(
                            $fileInfoIteratorIterator,
                            '/^.+\.'.$extension.'$/i',
                            RecursiveRegexIterator::GET_MATCH);

    $videoFileList = [];
    foreach ($fileInfoIterator as $filename => $fileList) {
        array_push($videoFileList, $filename);
    }
    return $videoFileList;
}

function findMp4Files($searchDirectory) {
    return findFilesWithExtension("mp4", $searchDirectory);
}

$searchDirectory = "videos/";
$mp4FileList = findMp4Files($searchDirectory);

echo json_encode($mp4FileList);

?>