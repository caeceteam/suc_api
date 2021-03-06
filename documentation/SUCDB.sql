-- MySQL Script generated by MySQL Workbench
-- Wed May 17 20:49:56 2017
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema sucDB
-- -----------------------------------------------------
-- Base de datos de SUC

-- -----------------------------------------------------
-- Schema sucDB
--
-- Base de datos de SUC
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `sucDB` DEFAULT CHARACTER SET utf8 ;
USE `sucDB` ;

-- -----------------------------------------------------
-- Table `sucDB`.`User`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sucDB`.`User` (
  `idUser` BIGINT(32) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `surname` VARCHAR(45) NOT NULL,
  `alias` VARCHAR(12) NOT NULL,
  `pass` CHAR(64) NOT NULL,
  `mail` VARCHAR(60) NOT NULL,
  `idDiner` BIGINT(32) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `state` INT NOT NULL,
  `role` INT NOT NULL,
  `docNumber` VARCHAR(20) NULL,
  `bornDate` DATE NULL,
  PRIMARY KEY (`idUser`),
  UNIQUE INDEX `alias_UNIQUE` (`alias` ASC))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
