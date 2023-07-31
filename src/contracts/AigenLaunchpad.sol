// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";

error AccessNotAllowed();
error OnlyContractOwnerAllowed();
error OnlyProjectOwnerAllowed();
error OnlyAccountOwnerAllowed();
error OnlyAccountOwnerAndContractOwnerAllowed();
error TokenAlreadyLinked();

contract AigenLaunchpad {
    using Counters for Counters.Counter;
    Counters.Counter private _projectCount;
    Counters.Counter private _ainftCount;

    event ProjectCreated(uint256 indexed project_id);

    address owner;

    constructor() {
        owner = msg.sender;
    }

    struct Project {
        uint256 id;
        string detailUri;
        uint256 price;
    }

    struct AINFT {
        uint256 id;
        address nftAddress;
        uint256 tokenId;
        uint256 price;
    }

    mapping(address => mapping(uint256 => Project)) public projects;
    mapping(uint256 => mapping(uint256 => AINFT)) public ainfts;
    mapping(address => uint256[]) public userProjects;
    mapping(uint256 => uint256[]) public projectAINFTs;
    mapping(uint256 => uint256) public projectTokens;

    modifier isProjectOwnerOrContractOwner(
        uint256 projectId
    ) {
        if (!isProjectExists(msg.sender, projectId) && msg.sender != owner) {
            revert AccessNotAllowed();
        }
        _;
    }

    function isProjectExists(address account, uint256 projectId) internal view returns (bool) {
        if (bytes(projects[account][projectId].detailUri).length != 0) {
            return true;
        }
        else {
            return false;
        }
    }

    function isAINFTExists(uint256 projectId, uint256 ainftId) internal view returns (bool) {
        if (ainfts[projectId][ainftId].id > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    modifier isAccountOwnerOrContractOwner(
        address account
    ) {
        if (msg.sender != account && account != owner) {
            revert OnlyAccountOwnerAndContractOwnerAllowed();
        }
        _;
    }

    modifier onlyContractOwner {
        if (msg.sender != owner) {
            revert OnlyContractOwnerAllowed();
        }
        _;
    }

    modifier isContractOwner() {
        if (msg.sender != owner) {
            revert OnlyContractOwnerAllowed();
        }
        _;
    }

    modifier onlyAccountOwner(address account) {
        if (msg.sender != account) {
            revert OnlyAccountOwnerAllowed();
        }
        _;
    }

    modifier isProjectOwner(address account, uint256 projectId) {
        if (!isProjectExists(account, projectId)) {
            revert OnlyProjectOwnerAllowed();
        }
        _;
    }

    // create a project and assign it to the owner
    function createProject(string memory detailUri) external payable {
        uint256 projectId = _projectCount.current();
        Project memory project = Project(projectId, detailUri, 0);
        projects[msg.sender][projectId] = project;
        userProjects[msg.sender].push(projectId);
        _projectCount.increment();
        emit ProjectCreated(projectId);
    }

    // get project with project id
    function getProjectById(uint256 projectId) public view returns (Project memory) {
        return projects[msg.sender][projectId];
    }

    function getProjectsCount() public view returns (uint256) {
        return _projectCount.current();
    }

    function getMyProjects() public view
    returns (Project[] memory) {
        uint256[] memory userProjects1 = userProjects[msg.sender];
        Project[] memory items = new Project[](userProjects1.length);
        for (uint256 i = 0; i < userProjects1.length; i++) {
            items[i] = projects[msg.sender][userProjects1[i]];
        }
        return items;
    }

    // this function is for contract owner only
    function getProjectsByAccount(address account) public view isContractOwner() returns (Project[] memory) {
        uint256[] memory userProjects1 = userProjects[account];
        Project[] memory items = new Project[](userProjects1.length);
        for (uint256 i = 0; i < userProjects1.length; i++) {
            items[i] = projects[account][userProjects1[i]];
        }
        return items;
    }

    // Set project price of a project with this function
    function setProjectPrice(uint256 projectId, uint256 price) public isProjectOwner(msg.sender, projectId) {
        projects[msg.sender][projectId].price = price;
    }

    // create AI NFT for given token ids
    function createAINFT(uint256 projectId, address nftContract, uint256[] memory tokenIds) external payable
    isProjectOwner(msg.sender, projectId)
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            // Check if this tokenId is already linked to this project
            if (projectTokens[tokenIds[i]] > 0) {
                revert TokenAlreadyLinked();
            }

            ainfts[projectId][_ainftCount.current()] = AINFT(_ainftCount.current(), nftContract, tokenIds[i], 0);
            projectAINFTs[projectId].push(_ainftCount.current());
            _ainftCount.increment();
        }
    }

    function getAINFTByProject(uint256 projectId) public view
    isProjectOwner(msg.sender, projectId)
    returns (uint256[] memory){
        return projectAINFTs[projectId];
    }

    function getAINFTById(uint256 projectId, uint256 ainftId) public view
    isProjectOwner(msg.sender, projectId)
    returns (AINFT memory){
        return ainfts[projectId][ainftId];
    }

    function getAINFTByTokenId(uint256 projectId, uint256 tokenId) public view
    isProjectOwner(msg.sender, projectId)
    returns (AINFT memory) {
        uint256[] memory ainfts1 = projectAINFTs[projectId];
        AINFT memory ainft1;
        for (uint256 i = 0; i < ainfts1.length; i++) {
            AINFT memory ainft = ainfts[projectId][ainfts1[i]];
            if (ainft.tokenId == tokenId) {
                ainft1 = ainft;
            }
        }

        return ainft1;
    }
}
