// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MagaNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    struct NFTData {
        uint256 tokenId;
        string tokenURI;
    }

    event Minted(address indexed to, uint256 indexed tokenId, string uri);

    constructor(address initialOwner) ERC721("MagaNFT", "MNFT") Ownable(initialOwner) {}

    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        _tokenIds++;
        uint256 newItemId = _tokenIds;
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        emit Minted(recipient, newItemId, tokenURI);
        return newItemId;
    }

    function totalMinted() public view returns (uint256) {
        return _tokenIds;
    }

    // ✅ NEW: return all minted token IDs and URIs
    function getAllTokens() public view returns (NFTData[] memory) {
        uint256 total = _tokenIds;
        NFTData[] memory tokens = new NFTData[](total);

        for (uint256 i = 0; i < total; i++) {
            uint256 tokenId = i + 1;
            string memory uri = tokenURI(tokenId);
            tokens[i] = NFTData(tokenId, uri);
        }
        return tokens;
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
